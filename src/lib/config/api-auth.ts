import { createHash, timingSafeEqual } from "crypto";

export function wallboxApiKeys() {
  return [process.env.WALLBOX_API_KEY, process.env.WALLBOX_API_KEYS]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

export function wallboxApiAuthConfigured() {
  return wallboxApiKeys().length > 0;
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

export function isWallboxApiAuthorized(request: Pick<Request, "headers">) {
  const keys = wallboxApiKeys();
  if (keys.length === 0) return process.env.NODE_ENV !== "production";

  const token = tokenFromRequest(request);
  if (!token) return false;

  const tokenDigest = digest(token);
  return keys.some((key) => timingSafeEqual(tokenDigest, digest(key)));
}

export function externalApiAuthErrorMessage() {
  return wallboxApiAuthConfigured()
    ? "Invalid or missing Wallbox API key. Send x-wallbox-api-key or Authorization: Bearer <key>."
    : "WALLBOX_API_KEY is required for external capture submissions in production.";
}
