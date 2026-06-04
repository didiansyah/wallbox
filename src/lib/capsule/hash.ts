import { createHash } from "crypto";

export function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, canonicalize(v)]));
  }
  return value;
}
export function canonicalJson(value: unknown): string { return JSON.stringify(canonicalize(value)); }
export function sha256String(input: string | Buffer): string { return "0x" + createHash("sha256").update(input).digest("hex"); }
export function sha256CanonicalJson(value: unknown): string { return sha256String(canonicalJson(value)); }
export function shortHash(hash?: string, chars = 12): string { return hash ? `${hash.slice(0, chars + 2)}…${hash.slice(-6)}` : "pending"; }
