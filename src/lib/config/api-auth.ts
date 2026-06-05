import { createHash, timingSafeEqual } from "crypto";
import { authenticateStoredProjectKey, listStoredProjectKeys, projectCount as storedProjectCount } from "@/lib/storage/project-store";

export type WallboxProjectKey = {
  projectId: string;
  projectName: string;
  key: string;
  source: "WALLBOX_API_KEY" | "WALLBOX_API_KEYS";
};

export type WallboxAuthContext = {
  projectId: string;
  projectName: string;
  keyHash: string;
};

const DEFAULT_PROJECT_ID = "default";
const DEFAULT_PROJECT_NAME = "Default project";

export function normalizeWallboxProjectId(value: string) {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9_.:-]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || DEFAULT_PROJECT_ID;
}

function humanizeProjectName(projectId: string) {
  if (projectId === DEFAULT_PROJECT_ID) return DEFAULT_PROJECT_NAME;
  return projectId
    .split(/[_.:-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseProjectKey(entry: string, source: WallboxProjectKey["source"]): WallboxProjectKey | null {
  const value = entry.trim();
  if (!value) return null;

  // Supported rotation formats:
  //   wbx_secret                  -> default project
  //   project_id=wbx_secret       -> project-scoped key
  //   project_id:wbx_secret       -> project-scoped key
  //   project_id|Project Name|key -> project-scoped key with display name
  const pipe = value.split("|");
  if (pipe.length >= 3) {
    const projectId = normalizeWallboxProjectId(pipe[0] || DEFAULT_PROJECT_ID);
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

  return { projectId: DEFAULT_PROJECT_ID, projectName: DEFAULT_PROJECT_NAME, key: value, source };
}

export function wallboxProjectKeysFromEnv(): WallboxProjectKey[] {
  const entries: WallboxProjectKey[] = [];

  if (process.env.WALLBOX_API_KEY) {
    const parsed = parseProjectKey(process.env.WALLBOX_API_KEY, "WALLBOX_API_KEY");
    if (parsed) entries.push(parsed);
  }

  if (process.env.WALLBOX_API_KEYS) {
    for (const entry of String(process.env.WALLBOX_API_KEYS).split(",")) {
      const parsed = parseProjectKey(entry, "WALLBOX_API_KEYS");
      if (parsed) entries.push(parsed);
    }
  }

  return entries;
}

export function wallboxProjectKeys(): WallboxProjectKey[] {
  return wallboxProjectKeysFromEnv();
}

export function wallboxApiKeys() {
  return wallboxProjectKeysFromEnv().map((entry) => entry.key);
}

export function wallboxProjectCount() {
  return storedProjectCount();
}

export function wallboxApiAuthConfigured() {
  return wallboxProjectKeysFromEnv().length > 0 || listStoredProjectKeys().length > 0;
}

function tokenFromRequest(request: Pick<Request, "headers">) {
  const explicit = request.headers.get("x-wallbox-api-key")?.trim();
  if (explicit) return explicit;

  const authorization = request.headers.get("authorization")?.trim();
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  return bearer || "";
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function wallboxKeyHash(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

export function maskWallboxKey(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length <= 10) return `${trimmed.slice(0, 3)}…${trimmed.slice(-2)}`;
  return `${trimmed.slice(0, 6)}…${trimmed.slice(-4)}`;
}

export function wallboxMaskedProjectKeys() {
  return wallboxProjectKeysFromEnv().map(({ key, ...entry }) => ({
    ...entry,
    keyHash: wallboxKeyHash(key),
    maskedKey: maskWallboxKey(key),
  }));
}

export function wallboxAuthContext(request: Pick<Request, "headers">): WallboxAuthContext | null {
  const keys = wallboxProjectKeysFromEnv();
  const token = tokenFromRequest(request);

  if (token) {
    const storedKey = authenticateStoredProjectKey(token);
    if (storedKey) {
      return { projectId: storedKey.projectId, projectName: storedKey.projectName, keyHash: wallboxKeyHash(token) };
    }
  }

  if (keys.length === 0) {
    if (process.env.NODE_ENV === "production") return null;
    return { projectId: DEFAULT_PROJECT_ID, projectName: DEFAULT_PROJECT_NAME, keyHash: "dev-no-key" };
  }

  if (!token) return null;

  const tokenDigest = digest(token);
  for (const projectKey of keys) {
    if (timingSafeEqual(tokenDigest, digest(projectKey.key))) {
      return { projectId: projectKey.projectId, projectName: projectKey.projectName, keyHash: wallboxKeyHash(projectKey.key) };
    }
  }

  return null;
}

export function isWallboxApiAuthorized(request: Pick<Request, "headers">) {
  return wallboxAuthContext(request) !== null;
}

export function externalApiAuthErrorMessage() {
  return wallboxApiAuthConfigured()
    ? "Invalid or missing Wallbox API key. Send x-wallbox-api-key or Authorization: Bearer <key>."
    : "WALLBOX_API_KEY is required for external capture submissions in production.";
}
