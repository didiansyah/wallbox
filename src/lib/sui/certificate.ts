import { certificateMode } from "@/lib/config/env";
import { findRunByCertificate } from "@/lib/storage/local-store";
import { sha256CanonicalJson } from "@/lib/capsule/hash";
import { tatumRpc } from "./tatum-client";

export type WallboxCertificate = { certificateId:string; txDigest:string; runId:string; agentId:string; capsuleHash:string; walrusBlobId:string; schemaVersion:string; createdAtMs:number; mode:"sui-tatum"|"local"; network:string; raw?:unknown };
export async function createCertificate(input: { runId:string; agentId:string; capsuleHash:string; walrusBlobId:string; schemaVersion:string }): Promise<WallboxCertificate> {
  const mode = certificateMode();
  const createdAtMs = Date.now();
  if (mode === "sui-tatum") {
    if (!process.env.SUI_PACKAGE_ID || !process.env.SUI_PRIVATE_KEY) throw new Error("SUI_PACKAGE_ID and SUI_PRIVATE_KEY are required for sui-tatum certificate creation");
    // Hackathon-safe wrapper: expose Tatum RPC path and fail clearly until package/signing is configured.
    await tatumRpc("sui_getLatestSuiSystemState", []);
    throw new Error("Sui transaction signing is not configured yet. Set WALLBOX_CERTIFICATE_MODE=local for demo mode or deploy the Move package.");
  }
  const seed = sha256CanonicalJson({ ...input, createdAtMs: input.runId });
  return { certificateId:`local-sui-${seed.slice(2,42)}`, txDigest:`local-tx-${seed.slice(42,82)}`, ...input, createdAtMs, mode:"local", network:"local-demo" };
}
export async function readCertificate(certificateId: string): Promise<WallboxCertificate | null> {
  if (certificateId.startsWith("local-tampered/")) {
    const runId = certificateId.split("/").pop()!;
    const record = await findRunByCertificate(recordlessId(runId));
    return record?.certificate as WallboxCertificate || null;
  }
  if (certificateMode() === "sui-tatum" && !certificateId.startsWith("local-sui-")) {
    const raw = await tatumRpc("sui_getObject", [certificateId, { showContent:true }]);
    return { certificateId, txDigest:certificateId, runId:"unknown", agentId:"unknown", capsuleHash:"", walrusBlobId:"", schemaVersion:"wallbox.audit_capsule.v1", createdAtMs:Date.now(), mode:"sui-tatum", network:process.env.SUI_NETWORK || "testnet", raw };
  }
  const record = await findRunByCertificate(certificateId);
  return (record?.certificate as WallboxCertificate) || null;
}
function recordlessId(runId: string) { return runId; }
