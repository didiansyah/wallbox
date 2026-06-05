import { randomBytes, createHash } from "crypto";
import { mkdirSync } from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";

export type WallboxProjectKeyLike = {
  projectId: string;
  projectName: string;
  key: string;
  source: "WALLBOX_API_KEY" | "WALLBOX_API_KEYS";
};

const DEFAULT_DATA_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), "data");
const DEFAULT_SQLITE_PATH = path.join(DEFAULT_DATA_DIR, "wallbox.sqlite");

export type StoredProject = {
  projectId: string;
  projectName: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
};

export type StoredProjectKey = {
  keyId: string;
  projectId: string;
  projectName: string;
  label: string;
  keyHash: string;
  keyPrefix: string;
  maskedKey: string;
  source: "sqlite";
  createdAt: string;
  revokedAt?: string | null;
};

export type ProjectSummary = {
  projectId: string;
  projectName: string;
  source: string;
  keyId?: string;
  label?: string;
  maskedKey: string;
  keyHash: string;
  active: boolean;
  createdAt?: string;
  revokedAt?: string | null;
  stats: { total: number; verified: number; latest?: string };
};

type ProjectRow = { project_id: string; project_name: string; created_at: string; updated_at: string; archived_at?: string | null };
type KeyRow = { key_id: string; project_id: string; project_name: string; label: string; key_hash: string; key_prefix: string; created_at: string; revoked_at?: string | null };
type CountRow = { project_id: string; project_name: string; total: number; verified: number; latest?: string };

let dbState: { db: DatabaseSync; sqlitePath: string } | null = null;

function sqlitePath() {
  const configured = process.env.WALLBOX_SQLITE_PATH;
  if (!configured) return DEFAULT_SQLITE_PATH;
  return path.isAbsolute(configured) ? path.normalize(/* turbopackIgnore: true */ configured) : path.join(DEFAULT_DATA_DIR, /* turbopackIgnore: true */ configured);
}

function openProjectDb() {
  const currentPath = sqlitePath();
  if (dbState?.sqlitePath === currentPath) return dbState.db;
  dbState?.db.close();
  mkdirSync(path.dirname(currentPath), { recursive: true });
  const db = new DatabaseSync(currentPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    CREATE TABLE IF NOT EXISTS projects (
      project_id TEXT PRIMARY KEY,
      project_name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      archived_at TEXT
    );
    CREATE TABLE IF NOT EXISTS api_keys (
      key_id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      label TEXT NOT NULL,
      key_hash TEXT NOT NULL UNIQUE,
      key_prefix TEXT NOT NULL,
      created_at TEXT NOT NULL,
      revoked_at TEXT,
      FOREIGN KEY(project_id) REFERENCES projects(project_id)
    );
    CREATE INDEX IF NOT EXISTS idx_api_keys_project ON api_keys(project_id, revoked_at, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
  `);
  dbState = { db, sqlitePath: currentPath };
  return db;
}

function nowIso() { return new Date().toISOString(); }

function normalizeWallboxProjectId(value: string) {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9_.:-]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || "default";
}

function humanizeProjectName(projectId: string) {
  if (projectId === "default") return "Default project";
  return projectId
    .split(/[_.:-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseEnvProjectKey(entry: string, source: WallboxProjectKeyLike["source"]): WallboxProjectKeyLike | null {
  const value = entry.trim();
  if (!value) return null;
  const pipe = value.split("|");
  if (pipe.length >= 3) {
    const projectId = normalizeWallboxProjectId(pipe[0] || "default");
    const projectName = (pipe[1] || humanizeProjectName(projectId)).trim();
    const key = pipe.slice(2).join("|").trim();
    return key ? { projectId, projectName, key, source } : null;
  }
  const separator = value.includes("=") ? "=" : value.includes(":") ? ":" : "";
  if (separator) {
    const [projectRaw, ...keyParts] = value.split(separator);
    const key = keyParts.join(separator).trim();
    if (projectRaw && key) {
      const projectId = normalizeWallboxProjectId(projectRaw);
      return { projectId, projectName: humanizeProjectName(projectId), key, source };
    }
  }
  return { projectId: "default", projectName: "Default project", key: value, source };
}

function envProjectKeys(): WallboxProjectKeyLike[] {
  const entries: WallboxProjectKeyLike[] = [];
  if (process.env.WALLBOX_API_KEY) {
    const parsed = parseEnvProjectKey(process.env.WALLBOX_API_KEY, "WALLBOX_API_KEY");
    if (parsed) entries.push(parsed);
  }
  if (process.env.WALLBOX_API_KEYS) {
    for (const entry of String(process.env.WALLBOX_API_KEYS).split(",")) {
      const parsed = parseEnvProjectKey(entry, "WALLBOX_API_KEYS");
      if (parsed) entries.push(parsed);
    }
  }
  return entries;
}

function shortKeyHash(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function maskKey(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length <= 10) return `${trimmed.slice(0, 3)}…${trimmed.slice(-2)}`;
  return `${trimmed.slice(0, 6)}…${trimmed.slice(-4)}`;
}

function keyHashFull(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

function keyPrefix(key: string) {
  const trimmed = key.trim();
  return trimmed.length <= 10 ? trimmed.slice(0, 6) : trimmed.slice(0, 10);
}

function rowToProject(row: ProjectRow): StoredProject {
  return { projectId: row.project_id, projectName: row.project_name, createdAt: row.created_at, updatedAt: row.updated_at, archivedAt: row.archived_at };
}

function rowToKey(row: KeyRow): StoredProjectKey {
  return {
    keyId: row.key_id,
    projectId: row.project_id,
    projectName: row.project_name,
    label: row.label,
    keyHash: row.key_hash.slice(0, 16),
    keyPrefix: row.key_prefix,
    maskedKey: `${row.key_prefix}…${row.key_hash.slice(-4)}`,
    source: "sqlite",
    createdAt: row.created_at,
    revokedAt: row.revoked_at,
  };
}

export function ensureProject(projectId: string, projectName?: string) {
  const db = openProjectDb();
  const id = normalizeWallboxProjectId(projectId);
  const name = (projectName || id).trim() || id;
  const now = nowIso();
  db.prepare(`
    INSERT INTO projects(project_id, project_name, created_at, updated_at)
    VALUES(?, ?, ?, ?)
    ON CONFLICT(project_id) DO UPDATE SET project_name = excluded.project_name, updated_at = excluded.updated_at, archived_at = NULL
  `).run(id, name, now, now);
  return { projectId: id, projectName: name };
}

export function listProjects(): StoredProject[] {
  const rows = openProjectDb().prepare("SELECT project_id, project_name, created_at, updated_at, archived_at FROM projects ORDER BY created_at DESC").all() as ProjectRow[];
  return rows.map(rowToProject);
}

export function listStoredProjectKeys(includeRevoked = false): StoredProjectKey[] {
  const where = includeRevoked ? "" : "WHERE k.revoked_at IS NULL";
  const rows = openProjectDb().prepare(`
    SELECT k.key_id, k.project_id, p.project_name, k.label, k.key_hash, k.key_prefix, k.created_at, k.revoked_at
    FROM api_keys k JOIN projects p ON p.project_id = k.project_id
    ${where}
    ORDER BY k.created_at DESC
  `).all() as KeyRow[];
  return rows.map(rowToKey);
}

export function storedProjectKeysForAuth(): WallboxProjectKeyLike[] {
  const rows = openProjectDb().prepare(`
    SELECT k.key_id, k.project_id, p.project_name, k.key_hash, k.key_prefix, k.created_at, k.revoked_at
    FROM api_keys k JOIN projects p ON p.project_id = k.project_id
    WHERE k.revoked_at IS NULL
    ORDER BY k.created_at DESC
  `).all() as KeyRow[];
  return rows.map((row) => ({ projectId: row.project_id, projectName: row.project_name, key: row.key_hash, source: "WALLBOX_API_KEYS" as const }));
}

export function createProjectKey(input: { projectId: string; projectName?: string; label?: string }) {
  const project = ensureProject(input.projectId, input.projectName);
  const rawKey = `wbx_${project.projectId}_${randomBytes(24).toString("base64url")}`;
  const fullHash = keyHashFull(rawKey);
  const now = nowIso();
  const keyId = `key_${randomBytes(8).toString("hex")}`;
  openProjectDb().prepare(`
    INSERT INTO api_keys(key_id, project_id, label, key_hash, key_prefix, created_at)
    VALUES(?, ?, ?, ?, ?, ?)
  `).run(keyId, project.projectId, (input.label || "Default key").trim() || "Default key", fullHash, keyPrefix(rawKey), now);
  return { key: rawKey, keyRecord: listStoredProjectKeys(true).find((entry) => entry.keyId === keyId)! };
}

export function revokeProjectKey(keyId: string) {
  const now = nowIso();
  const result = openProjectDb().prepare("UPDATE api_keys SET revoked_at = ? WHERE key_id = ? AND revoked_at IS NULL").run(now, keyId);
  return result.changes > 0;
}

export function rotateProjectKey(keyId: string) {
  const db = openProjectDb();
  const row = db.prepare(`
    SELECT k.key_id, k.project_id, p.project_name, k.label, k.key_hash, k.key_prefix, k.created_at, k.revoked_at
    FROM api_keys k JOIN projects p ON p.project_id = k.project_id
    WHERE k.key_id = ? AND k.revoked_at IS NULL
  `).get(keyId) as KeyRow | undefined;
  if (!row) return null;
  revokeProjectKey(keyId);
  return createProjectKey({ projectId: row.project_id, projectName: row.project_name, label: row.label });
}

export function authenticateStoredProjectKey(rawKey: string): WallboxProjectKeyLike | null {
  const fullHash = keyHashFull(rawKey.trim());
  const row = openProjectDb().prepare(`
    SELECT k.key_id, k.project_id, p.project_name, k.label, k.key_hash, k.key_prefix, k.created_at, k.revoked_at
    FROM api_keys k JOIN projects p ON p.project_id = k.project_id
    WHERE k.key_hash = ? AND k.revoked_at IS NULL
    LIMIT 1
  `).get(fullHash) as KeyRow | undefined;
  if (!row) return null;
  return { projectId: row.project_id, projectName: row.project_name, key: fullHash, source: "WALLBOX_API_KEYS" };
}

export function projectCount() {
  const envCount = new Set(envProjectKeys().map((entry) => entry.projectId)).size;
  const dbCount = (openProjectDb().prepare("SELECT COUNT(*) AS count FROM projects WHERE archived_at IS NULL").get() as { count: number }).count;
  return envCount + dbCount;
}

export function listProjectSummaries(): ProjectSummary[] {
  const db = openProjectDb();
  const counts = (() => {
    try {
      return db.prepare(`
        SELECT project_id, project_name, COUNT(*) AS total,
          SUM(CASE WHEN status = 'VERIFIED' THEN 1 ELSE 0 END) AS verified,
          MAX(created_at) AS latest
        FROM runs GROUP BY project_id, project_name
      `).all() as CountRow[];
    } catch {
      return [] as CountRow[];
    }
  })();
  const stats = new Map(counts.map((row) => [row.project_id, { projectName: row.project_name, total: Number(row.total), verified: Number(row.verified || 0), latest: row.latest }]));

  const envRows: ProjectSummary[] = envProjectKeys().map((entry) => {
    const runStats = stats.get(entry.projectId) || { projectName: entry.projectName, total: 0, verified: 0, latest: undefined };
    return {
      projectId: entry.projectId,
      projectName: entry.projectName,
      source: entry.source,
      maskedKey: maskKey(entry.key),
      keyHash: shortKeyHash(entry.key),
      active: true,
      stats: runStats,
    };
  });

  const storedRows: ProjectSummary[] = listStoredProjectKeys(true).map((entry) => {
    const runStats = stats.get(entry.projectId) || { projectName: entry.projectName, total: 0, verified: 0, latest: undefined };
    return {
      projectId: entry.projectId,
      projectName: entry.projectName,
      source: "sqlite",
      keyId: entry.keyId,
      label: entry.label,
      maskedKey: entry.maskedKey,
      keyHash: entry.keyHash,
      active: !entry.revokedAt,
      createdAt: entry.createdAt,
      revokedAt: entry.revokedAt,
      stats: runStats,
    };
  });

  const known = new Set([...envRows, ...storedRows].map((row) => row.projectId));
  const orphanRows: ProjectSummary[] = Array.from(stats.entries())
    .filter(([projectId]) => !known.has(projectId))
    .map(([projectId, runStats]) => ({
      projectId,
      projectName: runStats.projectName,
      source: "stored runs",
      maskedKey: "—",
      keyHash: "—",
      active: false,
      stats: runStats,
    }));

  return [...storedRows, ...envRows, ...orphanRows];
}

export function closeProjectStoreForTests() {
  dbState?.db.close();
  dbState = null;
}
