import { NextResponse } from "next/server";
import { loadRun } from "@/lib/storage/local-store";
import { readCertificate } from "@/lib/sui/certificate";
import { fetchCapsule } from "@/lib/walrus/client";
import { verifyCapsule } from "@/lib/capsule/verify-capsule";

export async function GET(_request: Request, { params }: { params: Promise<{ certificateId:string[] }> }) {
  const certificateId = (await params).certificateId.join("/");
  try {
    let certificate = await readCertificate(certificateId);
    let capsule;
    if (certificateId.startsWith("local-tampered/")) {
      const runId = certificateId.split("/").pop()!;
      const record = await loadRun(runId);
      if (!record?.certificate) return NextResponse.json({ status:"CERTIFICATE_NOT_FOUND", certificate_id:certificateId }, { status:404 });
      certificate = record.certificate as NonNullable<typeof certificate>;
      capsule = record.tamperedCapsule || record.capsule;
    }
    if (!certificate) return NextResponse.json({ status:"CERTIFICATE_NOT_FOUND", certificate_id:certificateId }, { status:404 });
    capsule ||= await fetchCapsule(certificate.walrusBlobId);
    const result = verifyCapsule(capsule, certificate.capsuleHash);
    return NextResponse.json({ status:result.status, certificate_id:certificateId, sui_certificate_id:certificate.certificateId, sui_tx_digest:certificate.txDigest, certificate, walrus_blob_id:certificate.walrusBlobId, onchain_capsule_hash:certificate.capsuleHash, recomputed_capsule_hash:result.actualHash, files:result.fileChecks, schema_errors:result.schemaErrors, mode:{ blob: certificate.walrusBlobId.startsWith("local-walrus-") ? "local" : "walrus", certificate: certificate.mode }, capsule: result.status === "INVALID_SCHEMA" ? undefined : capsule });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("MISSING_BLOB") ? "MISSING_BLOB" : "INVALID_SCHEMA";
    return NextResponse.json({ status, certificate_id:certificateId, error:message }, { status: status === "MISSING_BLOB" ? 404 : 422 });
  }
}
