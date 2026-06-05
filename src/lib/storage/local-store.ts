import { promises as fs } from "fs";
import path from "path";
import type { AuditCapsule } from "@/lib/capsule/schema";

export type RunStatus =
  | "CREATED"
  | "AGENT_COMPLETED"
  | "CAPSULE_BUILT"
  | "WALRUS_UPLOADED"
  | "SUI_CERTIFIED"
  | "VERIFIED"
  | "FAILED"
  | "TAMPERED";

export type WallboxRun = {
  runId: string;
  status: RunStatus;
  task: string;
  taskHash: string;
  agentId: string;
  agentName: string;
  capsuleHash?: string;
  walrusBlobId?: string;
  suiCertificateId?: string;
  suiTxDigest?: string;
  blobMode?: string;
  certificateMode?: string;
  createdAt: string;
  updatedAt: string;
  error?: string;
};

export type StoredRun = {
  run: WallboxRun;
  capsule: AuditCapsule;
  tamperedCapsule?: AuditCapsule;
  certificate?: unknown;
};

const DEFAULT_STORAGE_DIR = path.join(/* turbopackIgnore: true*/ process.cwd(), "data", "runs");

function storageDir() {
  const configured = process.env.WALLBOX_STORAGE_DIR;
  if (!configured) return DEFAULT_STORAGE_DIR;

  // Runtime-only override for VPS deploys. Turbopack/NFT should not trace arbitrary env paths.
  return path.isAbsolute(configured)
    ? path.normalize(/* turbopackIgnore: true*/ configured)
    : path.join(DEFAULT_STORAGE_DIR, /* turbopackIgnore: true*/ configured);
}

function safeId(id: string) {
  if (!/^[a-zA-Z0-9_.:-]+$/.test(id)) throw new Error("Invalid ID");
  return id;
}

async function ensureDir() {
  await fs.mkdir(storageDir(), { recursive: true });
}

export function runPath(runId: string) {
  return path.join(storageDir(), `${safeId(runId)}.json`);
}

export async function saveRun(record: StoredRun) {
  await ensureDir();
  await fs.writeFile(runPath(record.run.runId), JSON.stringify(record, null, 2));
}

export async function loadRun(runId: string): Promise<StoredRun | null> {
  try {
    return JSON.parse(await fs.readFile(runPath(runId), "utf8"));
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}

export async function findRunByCertificate(certificateId: string): Promise<StoredRun | null> {
  await ensureDir();
  const files = await fs.readdir(storageDir());
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const record = JSON.parse(await fs.readFile(path.join(storageDir(), file), "utf8"));
    if (record.run?.suiCertificateId === certificateId || record.run?.suiTxDigest === certificateId) return record;
  }
  return null;
}

export async function findRunByBlob(blobId: string): Promise<StoredRun | null> {
  await ensureDir();
  const files = await fs.readdir(storageDir());
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const record = JSON.parse(await fs.readFile(path.join(storageDir(), file), "utf8"));
    if (record.run?.walrusBlobId === blobId) return record;
  }
  return null;
}

export async function tamperRun(runId: string) {
  const record = await loadRun(runId);
  if (!record) return null;

  const clone: AuditCapsule = JSON.parse(JSON.stringify(record.capsule));
  clone.artifacts["final_report.md"] +=
    "\n\nTampered local demo line: claimed profit guarantee was inserted after certification.\n";
  record.tamperedCapsule = clone;
  record.run.status = "TAMPERED";
  record.run.updatedAt = new Date().toISOString();
  await saveRun(record);
  return record;
}
