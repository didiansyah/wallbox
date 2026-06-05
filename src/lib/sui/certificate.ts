import { certificateMode, assertTestnetFirst } from "@/lib/config/env";
import { findRunByCertificate } from "@/lib/storage/local-store";
import { sha256CanonicalJson } from "@/lib/capsule/hash";
import { tatumRpc } from "./tatum-client";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const SUI_CLOCK_OBJECT_ID = "0x6";

export type WallboxCertificate = {
  certificateId: string;
  txDigest: string;
  runId: string;
  agentId: string;
  capsuleHash: string;
  walrusBlobId: string;
  schemaVersion: string;
  createdAtMs: number;
  mode: "sui-tatum" | "local";
  network: string;
  raw?: unknown;
};

type SuiObjectFields = Record<string, unknown> & { id?: { id?: string } | string };

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;
}

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "bigint") return String(value);

  const record = asRecord(value);
  if (!record) return "";

  if (typeof record.id === "string") return record.id;
  if (typeof record.value === "string") return record.value;
  if (Array.isArray(record.bytes)) return Buffer.from(record.bytes as number[]).toString("utf8");

  return "";
}

function asNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "bigint") return Number(value);
  return 0;
}

function objectIdFromFields(fields: SuiObjectFields, fallback: string) {
  if (typeof fields.id === "string") return fields.id;
  if (fields.id && typeof fields.id === "object" && typeof fields.id.id === "string") return fields.id.id;
  return fallback;
}

type SuiCliCallResult = {
  digest?: string;
  effects?: { status?: { status?: string; error?: string } };
  objectChanges?: Array<{ type?: string; objectType?: string; objectId?: string }>;
  events?: Array<{ parsedJson?: Record<string, unknown> }>;
};

export function parseSuiCreateCertificateResult(raw: SuiCliCallResult, fallback: Parameters<typeof createCertificate>[0]): WallboxCertificate {
  const status = raw.effects?.status;
  if (status?.status !== "success") throw new Error(`Sui certificate transaction failed: ${status?.error || "unknown status"}`);

  const created = raw.objectChanges?.find(
    (change) => change.type === "created" && change.objectType?.endsWith("::certificate::AgentRunCertificate"),
  );
  const event = raw.events?.find((item) => item.parsedJson?.certificate_id)?.parsedJson;
  const certificateId = created?.objectId || asString(event?.certificate_id);
  if (!certificateId) throw new Error("Sui certificate transaction succeeded but certificate object id was not found");

  return {
    certificateId,
    txDigest: raw.digest || certificateId,
    runId: asString(event?.run_id) || fallback.runId,
    agentId: asString(event?.agent_id) || fallback.agentId,
    capsuleHash: asString(event?.capsule_hash) || fallback.capsuleHash,
    walrusBlobId: asString(event?.walrus_blob_id) || fallback.walrusBlobId,
    schemaVersion: asString(event?.schema_version) || fallback.schemaVersion,
    createdAtMs: asNumber(event?.created_at_ms) || Date.now(),
    mode: "sui-tatum",
    network: process.env.SUI_NETWORK || "testnet",
    raw,
  };
}

async function createSuiCertificateWithCli(input: Parameters<typeof createCertificate>[0]): Promise<WallboxCertificate> {
  const packageId = process.env.SUI_PACKAGE_ID;
  if (!packageId) throw new Error("SUI_PACKAGE_ID is required for sui-tatum certificate creation");

  const suiBin = process.env.SUI_CLI_PATH || "/root/.local/bin/sui";
  const { stdout } = await execFileAsync(
    suiBin,
    [
      "client",
      "call",
      "--package",
      packageId,
      "--module",
      process.env.SUI_CERTIFICATE_MODULE || "certificate",
      "--function",
      "create_certificate",
      "--args",
      input.runId,
      input.agentId,
      input.capsuleHash,
      input.walrusBlobId,
      input.schemaVersion,
      SUI_CLOCK_OBJECT_ID,
      "--gas-budget",
      process.env.SUI_GAS_BUDGET || "50000000",
      "--json",
    ],
    { timeout: 60_000, maxBuffer: 1024 * 1024 * 5 },
  );

  return parseSuiCreateCertificateResult(JSON.parse(stdout) as SuiCliCallResult, input);
}

export function parseSuiCertificateObject(raw: unknown, fallbackId = "unknown"): WallboxCertificate {
  const root = asRecord(raw);
  const data = asRecord(root?.data) || root;
  const content = asRecord(data?.content);
  const fields = asRecord(content?.fields) as SuiObjectFields | undefined;

  if (!fields) throw new Error("Malformed Sui certificate object: content.fields missing");

  const certificateId = objectIdFromFields(fields, fallbackId);
  const cert: WallboxCertificate = {
    certificateId,
    txDigest: certificateId,
    runId: asString(fields.run_id),
    agentId: asString(fields.agent_id),
    capsuleHash: asString(fields.capsule_hash),
    walrusBlobId: asString(fields.walrus_blob_id),
    schemaVersion: asString(fields.schema_version) || "wallbox.audit_capsule.v1",
    createdAtMs: asNumber(fields.created_at_ms),
    mode: "sui-tatum",
    network: process.env.SUI_NETWORK || "testnet",
    raw,
  };

  const missing = [
    ["run_id", cert.runId],
    ["agent_id", cert.agentId],
    ["capsule_hash", cert.capsuleHash],
    ["walrus_blob_id", cert.walrusBlobId],
  ].filter(([, value]) => !value);

  if (missing.length) {
    throw new Error(`Malformed Sui certificate object: missing ${missing.map(([key]) => key).join(", ")}`);
  }

  return cert;
}

export async function createCertificate(input: {
  runId: string;
  agentId: string;
  capsuleHash: string;
  walrusBlobId: string;
  schemaVersion: string;
}): Promise<WallboxCertificate> {
  const mode = certificateMode();
  const createdAtMs = Date.now();

  if (mode === "sui-tatum") {
    assertTestnetFirst(process.env.SUI_NETWORK || "testnet", "Sui/Tatum");
    if (!process.env.SUI_PACKAGE_ID) {
      throw new Error("SUI_PACKAGE_ID is required for sui-tatum certificate creation");
    }

    await tatumRpc("sui_getTotalTransactionBlocks", []);
    return createSuiCertificateWithCli(input);
  }

  const seed = sha256CanonicalJson({ ...input, createdAtMs: input.runId });
  return {
    certificateId: `local-sui-${seed.slice(2, 42)}`,
    txDigest: `local-tx-${seed.slice(42, 82)}`,
    ...input,
    createdAtMs,
    mode: "local",
    network: "local-demo",
  };
}

export async function readCertificate(certificateId: string): Promise<WallboxCertificate | null> {
  if (certificateId.startsWith("local-tampered/")) {
    const runId = certificateId.split("/").pop()!;
    const record = await findRunByCertificate(recordlessId(runId));
    return (record?.certificate as WallboxCertificate) || null;
  }

  const localRecord = await findRunByCertificate(certificateId);
  const localCertificate = localRecord?.certificate as WallboxCertificate | undefined;

  // Tx digests are not Sui object IDs. If the verifier is opened by tx digest and
  // this node has the run record, use the stored certificate object directly.
  if (localRecord?.run?.suiTxDigest === certificateId && localCertificate) return localCertificate;

  if (certificateMode() === "sui-tatum" && !certificateId.startsWith("local-sui-")) {
    assertTestnetFirst(process.env.SUI_NETWORK || "testnet", "Sui/Tatum");
    const raw = await tatumRpc("sui_getObject", [certificateId, { showContent: true }]);
    const parsed = parseSuiCertificateObject(raw, certificateId);
    return localCertificate ? { ...parsed, txDigest: localCertificate.txDigest } : parsed;
  }

  return localCertificate || null;
}

function recordlessId(runId: string) {
  return runId;
}
