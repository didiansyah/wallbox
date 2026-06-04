import { certificateMode } from "@/lib/config/env";
import { findRunByCertificate } from "@/lib/storage/local-store";
import { sha256CanonicalJson } from "@/lib/capsule/hash";
import { tatumRpc } from "./tatum-client";

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
    if (!process.env.SUI_PACKAGE_ID || !process.env.SUI_PRIVATE_KEY) {
      throw new Error("SUI_PACKAGE_ID and SUI_PRIVATE_KEY are required for sui-tatum certificate creation");
    }

    await tatumRpc("sui_getLatestSuiSystemState", []);
    throw new Error(
      "Sui transaction signing is not configured yet. Deploy move/wallbox and wire create_certificate signing, or set WALLBOX_CERTIFICATE_MODE=local for demo mode.",
    );
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

  if (certificateMode() === "sui-tatum" && !certificateId.startsWith("local-sui-")) {
    const raw = await tatumRpc("sui_getObject", [certificateId, { showContent: true }]);
    return parseSuiCertificateObject(raw, certificateId);
  }

  const record = await findRunByCertificate(certificateId);
  return (record?.certificate as WallboxCertificate) || null;
}

function recordlessId(runId: string) {
  return runId;
}
