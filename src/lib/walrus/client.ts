import type { AuditCapsule } from "@/lib/capsule/schema";
import { blobStoreMode } from "@/lib/config/env";
import { findRunByBlob } from "@/lib/storage/local-store";
import { sha256CanonicalJson } from "@/lib/capsule/hash";

export type UploadResult = { blobId:string; mode:"walrus"|"local"; network:string; note?:string };
function extractBlobId(response: unknown, fallback: string) {
  const obj = response as Record<string, any>;
  return String(obj.blobId || obj.blob_id || obj.newlyCreated?.blobObject?.blobId || obj.alreadyCertified?.blobId || obj.alreadyCertified?.event?.blobId || fallback);
}
export async function uploadCapsule(capsule: AuditCapsule): Promise<UploadResult> {
  const mode = blobStoreMode();
  if (mode === "walrus") {
    const publisher = process.env.WALRUS_PUBLISHER_URL;
    if (!publisher) throw new Error("WALRUS_PUBLISHER_URL is required for walrus mode");
    const res = await fetch(`${publisher.replace(/\/$/, "")}/v1/blobs`, { method:"PUT", headers:{"content-type":"application/json"}, body:JSON.stringify(capsule) });
    if (!res.ok) throw new Error(`Walrus upload failed: ${res.status} ${await res.text()}`);
    const json = await res.json().catch(() => ({}));
    return { blobId: extractBlobId(json, `walrus_${sha256CanonicalJson(capsule).slice(2,18)}`), mode, network: process.env.WALRUS_NETWORK || "testnet" };
  }
  return { blobId:`local-walrus-${capsule.manifest.run_id}-${capsule.manifest.capsule_hash.slice(2,10)}`, mode:"local", network:"local-demo", note:"Local blob fallback uses the same interface as Walrus for hackathon development." };
}
export async function fetchCapsule(blobId: string): Promise<AuditCapsule> {
  if (blobId.startsWith("local-walrus-")) {
    const record = await findRunByBlob(blobId);
    if (!record) throw new Error("MISSING_BLOB");
    return record.tamperedCapsule || record.capsule;
  }
  const aggregator = process.env.WALRUS_AGGREGATOR_URL;
  if (!aggregator) throw new Error("WALRUS_AGGREGATOR_URL is required to fetch Walrus blobs");
  let last = "";
  for (const delay of [1000, 2000, 4000]) {
    const res = await fetch(`${aggregator.replace(/\/$/, "")}/v1/blobs/${encodeURIComponent(blobId)}`);
    if (res.ok) return await res.json();
    last = `${res.status} ${await res.text()}`;
    await new Promise((r) => setTimeout(r, delay));
  }
  throw new Error(`MISSING_BLOB: ${last}`);
}
