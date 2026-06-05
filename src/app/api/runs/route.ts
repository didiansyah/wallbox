import { NextResponse } from "next/server";
import { buildCapsule } from "@/lib/capsule/build-capsule";
import { sha256String } from "@/lib/capsule/hash";
import { createRunId, DEMO_TASK, runDemoAgent } from "@/lib/agent/demo-agent";
import { saveRun } from "@/lib/storage/local-store";
import { uploadCapsule } from "@/lib/walrus/client";
import { createCertificate } from "@/lib/sui/certificate";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const task = typeof body.task === "string" && body.task.trim() ? body.task.trim().slice(0, 2_000) : DEMO_TASK;
    const runId = createRunId();
    const agentOutput = runDemoAgent(runId, task);
    const capsule = buildCapsule(agentOutput);
    const walrus = await uploadCapsule(capsule);
    const certificate = await createCertificate({ runId, agentId:capsule.manifest.agent.id, capsuleHash:capsule.manifest.capsule_hash, walrusBlobId:walrus.blobId, schemaVersion:capsule.manifest.schema_version });
    const now = new Date().toISOString();
    const run = { runId, status:"VERIFIED" as const, task, taskHash:sha256String(task), agentId:capsule.manifest.agent.id, agentName:capsule.manifest.agent.name, capsuleHash:capsule.manifest.capsule_hash, walrusBlobId:walrus.blobId, suiCertificateId:certificate.certificateId, suiTxDigest:certificate.txDigest, blobMode:walrus.mode, certificateMode:certificate.mode, createdAt:now, updatedAt:now };
    await saveRun({ run, capsule, certificate });
    return NextResponse.json({ run_id:runId, status:"completed", capsule_hash:run.capsuleHash, walrus_blob_id:run.walrusBlobId, sui_certificate_id:run.suiCertificateId, sui_tx_digest:run.suiTxDigest, blob_mode:run.blobMode, certificate_mode:run.certificateMode, verify_url:`/verify/${run.suiCertificateId}`, capsule_url:`/capsules/${runId}` });
  } catch (error) {
    return NextResponse.json({ status:"FAILED", error:error instanceof Error ? error.message : "Unknown error" }, { status:500 });
  }
}
