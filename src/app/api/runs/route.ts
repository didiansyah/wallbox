import { NextResponse } from "next/server";
import { buildCapsule, buildCapsuleFromPayload } from "@/lib/capsule/build-capsule";
import { sha256String } from "@/lib/capsule/hash";
import { createRunId, DEMO_TASK, runDemoAgent } from "@/lib/agent/demo-agent";
import { ExternalRunSchema, externalRunToPayload } from "@/lib/agent/external-run";
import { listRuns, saveRun } from "@/lib/storage/local-store";
import { uploadCapsule } from "@/lib/walrus/client";
import { createCertificate } from "@/lib/sui/certificate";
import { externalApiAuthErrorMessage, wallboxAuthContext } from "@/lib/config/api-auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") || "100");
  const auth = wallboxAuthContext(request);
  const explicitProjectId = url.searchParams.get("project_id") || undefined;
  const projectId = auth?.projectId || explicitProjectId;
  const runs = await listRuns(Number.isFinite(limit) ? limit : 100, { projectId });
  return NextResponse.json({ runs, count: runs.length, project_id: projectId || "all" });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const generatedRunId = createRunId();
    const isExternal = body.mode === "external" || body.agent || body.trace || body.artifacts;

    const auth = wallboxAuthContext(request);
    if (isExternal && !auth) {
      return NextResponse.json({ status: "UNAUTHORIZED", error: externalApiAuthErrorMessage() }, { status: 401 });
    }

    const externalRun = isExternal ? ExternalRunSchema.parse(body) : null;
    const task = externalRun?.task ?? (typeof body.task === "string" && body.task.trim() ? body.task.trim().slice(0, 2_000) : DEMO_TASK);
    const capsule = externalRun
      ? buildCapsuleFromPayload(externalRunToPayload(externalRun, generatedRunId))
      : buildCapsule(runDemoAgent(generatedRunId, task));

    const resolvedRunId = capsule.manifest.run_id;
    const walrus = await uploadCapsule(capsule);
    const certificate = await createCertificate({
      runId: resolvedRunId,
      agentId: capsule.manifest.agent.id,
      capsuleHash: capsule.manifest.capsule_hash,
      walrusBlobId: walrus.blobId,
      schemaVersion: capsule.manifest.schema_version,
    });
    const now = new Date().toISOString();
    const run = {
      runId: resolvedRunId,
      status:"VERIFIED" as const,
      task,
      taskHash:sha256String(task),
      agentId:capsule.manifest.agent.id,
      agentName:capsule.manifest.agent.name,
      projectId:auth?.projectId || "demo",
      projectName:auth?.projectName || "Demo",
      capsuleHash:capsule.manifest.capsule_hash,
      walrusBlobId:walrus.blobId,
      suiCertificateId:certificate.certificateId,
      suiTxDigest:certificate.txDigest,
      blobMode:walrus.mode,
      certificateMode:certificate.mode,
      createdAt:now,
      updatedAt:now,
    };
    await saveRun({ run, capsule, certificate });
    return NextResponse.json({
      run_id:resolvedRunId,
      status:"completed",
      capsule_hash:run.capsuleHash,
      walrus_blob_id:run.walrusBlobId,
      sui_certificate_id:run.suiCertificateId,
      sui_tx_digest:run.suiTxDigest,
      blob_mode:run.blobMode,
      certificate_mode:run.certificateMode,
      integration_mode:isExternal ? "external" : "demo",
      project_id:run.projectId,
      project_name:run.projectName,
      verify_url:`/verify/${run.suiCertificateId}`,
      capsule_url:`/capsules/${resolvedRunId}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("[") || message.includes("Invalid") ? 400 : 500;
    return NextResponse.json({ status:"FAILED", error: message }, { status });
  }
}
