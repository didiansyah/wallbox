import { promises as fs } from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
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
  projectId?: string;
  projectName?: string;
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

const DEFAULT_DATA_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), "data");
const DEFAULT_STORAGE_DIR = path.join(DEFAULT_DATA_DIR, "runs");
const DEFAULT_SQLITE_PATH = path.join(DEFAULT_DATA_DIR, "wallbox.sqlite");

type RunRow = { record_json: string };

type DbState = {
  db: DatabaseSync;
  sqlitePath: string;
  migratedFrom: string;
};

let state: DbState | null = null;

function dataDir() {
  return path.dirname(sqlitePath());
}

function sqlitePath() {
  const configured = process.env.WALLBOX_SQLITE_PATH;
  if (!configured) return DEFAULT_SQLITE_PATH;
  return path.isAbsolute(configured)
    ? path.normalize(/* turbopackIgnore: true */ configured)
    : path.join(DEFAULT_DATA_DIR, /* turbopackIgnore: true */ configured);
}

function storageDir() {
  const configured = process.env.WALLBOX_STORAGE_DIR;
  if (!configured) return DEFAULT_STORAGE_DIR;

  // Legacy JSON import path. Runtime-only override for VPS deploys.
  return path.isAbsolute(configured)
    ? path.normalize(/* turbopackIgnore: true */ configured)
    : path.join(DEFAULT_STORAGE_DIR, /* turbopackIgnore: true */ configured);
}

function safeId(id: string) {
  if (!/^[a-zA-Z0-9_.:-]+$/.test(id)) throw new Error("Invalid ID");
  return id;
}

async function ensureDir() {
  await fs.mkdir(dataDir(), { recursive: true });
  await fs.mkdir(storageDir(), { recursive: true });
}

export function runPath(runId: string) {
  return path.join(storageDir(), `${safeId(runId)}.json`);
}

function normalizeRun(run: WallboxRun): WallboxRun {
  return {
    ...run,
    projectId: run.projectId || "legacy",
    projectName: run.projectName || "Legacy",
  };
}

function normalizeRecord(record: StoredRun): StoredRun {
  return { ...record, run: normalizeRun(record.run) };
}

function openDb() {
  const currentPath = sqlitePath();
  const currentStorageDir = storageDir();
  if (state && state.sqlitePath === currentPath && state.migratedFrom === currentStorageDir) return state.db;

  state?.db.close();
  const db = new DatabaseSync(currentPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    CREATE TABLE IF NOT EXISTS runs (
      run_id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      project_name TEXT NOT NULL,
      status TEXT NOT NULL,
      task TEXT NOT NULL,
      task_hash TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      agent_name TEXT NOT NULL,
      capsule_hash TEXT,
      walrus_blob_id TEXT,
      sui_certificate_id TEXT,
      sui_tx_digest TEXT,
      blob_mode TEXT,
      certificate_mode TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      error TEXT,
      record_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_runs_project_created ON runs(project_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_runs_created ON runs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_runs_certificate ON runs(sui_certificate_id);
    CREATE INDEX IF NOT EXISTS idx_runs_tx ON runs(sui_tx_digest);
    CREATE INDEX IF NOT EXISTS idx_runs_blob ON runs(walrus_blob_id);
  `);

  state = { db, sqlitePath: currentPath, migratedFrom: currentStorageDir };
  return db;
}

function upsertRecord(db: DatabaseSync, record: StoredRun) {
  const normalized = normalizeRecord(record);
  const run = normalized.run;
  const projectId = run.projectId || "legacy";
  const projectName = run.projectName || "Legacy";
  db.prepare(`
    INSERT INTO runs (
      run_id, project_id, project_name, status, task, task_hash, agent_id, agent_name,
      capsule_hash, walrus_blob_id, sui_certificate_id, sui_tx_digest, blob_mode,
      certificate_mode, created_at, updated_at, error, record_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(run_id) DO UPDATE SET
      project_id = excluded.project_id,
      project_name = excluded.project_name,
      status = excluded.status,
      task = excluded.task,
      task_hash = excluded.task_hash,
      agent_id = excluded.agent_id,
      agent_name = excluded.agent_name,
      capsule_hash = excluded.capsule_hash,
      walrus_blob_id = excluded.walrus_blob_id,
      sui_certificate_id = excluded.sui_certificate_id,
      sui_tx_digest = excluded.sui_tx_digest,
      blob_mode = excluded.blob_mode,
      certificate_mode = excluded.certificate_mode,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at,
      error = excluded.error,
      record_json = excluded.record_json
  `).run(
    run.runId,
    projectId,
    projectName,
    run.status,
    run.task,
    run.taskHash,
    run.agentId,
    run.agentName,
    run.capsuleHash ?? null,
    run.walrusBlobId ?? null,
    run.suiCertificateId ?? null,
    run.suiTxDigest ?? null,
    run.blobMode ?? null,
    run.certificateMode ?? null,
    run.createdAt,
    run.updatedAt,
    run.error ?? null,
    JSON.stringify(normalized),
  );
}

async function migrateJsonRuns(db: DatabaseSync) {
  await fs.mkdir(storageDir(), { recursive: true });
  const marker = db.prepare("SELECT value FROM metadata WHERE key = ?").get("json_migrated_from") as { value?: string } | undefined;
  if (marker?.value === storageDir()) return;

  const files = await fs.readdir(storageDir()).catch(() => [] as string[]);
  const records: StoredRun[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    try {
      const record = JSON.parse(await fs.readFile(path.join(storageDir(), file), "utf8")) as StoredRun;
      if (record.run?.runId) records.push(record);
    } catch {
      // Ignore malformed local records so the dashboard still loads.
    }
  }

  if (records.length) {
    db.exec("BEGIN");
    try {
      for (const record of records) upsertRecord(db, record);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
  db.prepare("INSERT INTO metadata(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run("json_migrated_from", storageDir());
}

async function dbReady() {
  await ensureDir();
  const db = openDb();
  db.exec("CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
  await migrateJsonRuns(db);
  return db;
}

function parseRecord(row: RunRow | undefined): StoredRun | null {
  if (!row?.record_json) return null;
  return normalizeRecord(JSON.parse(row.record_json) as StoredRun);
}

export async function saveRun(record: StoredRun) {
  const db = await dbReady();
  upsertRecord(db, record);

  // Keep the legacy JSON file as an operational backup/export format.
  await fs.writeFile(runPath(record.run.runId), JSON.stringify(normalizeRecord(record), null, 2));
}

export async function loadRun(runId: string): Promise<StoredRun | null> {
  safeId(runId);
  const db = await dbReady();
  const row = db.prepare("SELECT record_json FROM runs WHERE run_id = ?").get(runId) as RunRow | undefined;
  return parseRecord(row);
}

export async function listRuns(limit = 100, filters: { projectId?: string } = {}): Promise<WallboxRun[]> {
  const db = await dbReady();
  const safeLimit = Math.max(1, Math.min(limit, 500));
  const rows = filters.projectId
    ? (db.prepare("SELECT record_json FROM runs WHERE project_id = ? ORDER BY created_at DESC LIMIT ?").all(filters.projectId, safeLimit) as RunRow[])
    : (db.prepare("SELECT record_json FROM runs ORDER BY created_at DESC LIMIT ?").all(safeLimit) as RunRow[]);

  return rows.map((row) => parseRecord(row)?.run).filter((run): run is WallboxRun => Boolean(run));
}

export async function findRunByCertificate(certificateId: string): Promise<StoredRun | null> {
  const db = await dbReady();
  const row = db.prepare("SELECT record_json FROM runs WHERE sui_certificate_id = ? OR sui_tx_digest = ? LIMIT 1").get(certificateId, certificateId) as RunRow | undefined;
  return parseRecord(row);
}

export async function findRunByBlob(blobId: string): Promise<StoredRun | null> {
  const db = await dbReady();
  const row = db.prepare("SELECT record_json FROM runs WHERE walrus_blob_id = ? LIMIT 1").get(blobId) as RunRow | undefined;
  return parseRecord(row);
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

export function closeRunStoreForTests() {
  state?.db.close();
  state = null;
}
