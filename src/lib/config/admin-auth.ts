import { createHash, timingSafeEqual } from "crypto";
import { wallboxApiKeys } from "@/lib/config/api-auth";

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

function safeEquals(a: string, b: string) {
  if (!a || !b) return false;
  return timingSafeEqual(digest(a), digest(b));
}

export function configuredAdminKeys() {
  return [process.env.WALLBOX_ADMIN_KEY, process.env.WALLBOX_ADMIN_KEYS]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

export function wallboxAdminConfigured() {
  return configuredAdminKeys().length > 0 || wallboxApiKeys().length > 0;
}

export function isWallboxAdminAuthorized(token?: string | null) {
  const trimmed = token?.trim();
  if (!trimmed) return false;

  const adminKeys = configuredAdminKeys();
  if (adminKeys.some((key) => safeEquals(trimmed, key))) return true;

  // Deployment fallback: until WALLBOX_ADMIN_KEY is provisioned, the server-side
  // capture key can unlock the read-only admin console. Never expose the key.
  return adminKeys.length === 0 && wallboxApiKeys().some((key) => safeEquals(trimmed, key));
}
