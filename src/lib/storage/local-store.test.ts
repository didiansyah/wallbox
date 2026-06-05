import { mkdtemp, rm } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildCapsuleFromPayload } from "@/lib/capsule/build-capsule";
import { sha256String } from "@/lib/capsule/hash";
import { closeRunStoreForTests, findRunByBlob, findRunByCertificate, listRuns, loadRun, saveRun, type StoredRun } from "./local-store";

let tempDir = "";

function record(runId: string, projectId: string): StoredRun {
  const now = new Date().toISOString();
  const task = `Task ${runId}`;
  const capsule = buildCapsuleFromPayload({
    runId,
    task,
    startedAt: now,
    completedAt: now,
    trace: [{ id: "step_1", type: "decision", name: "final", startedAt: now, completedAt: now, summary: "Done" }],
    sources: [],
    verdict: { verdict: "ok", riskLevel: "low", summary: "Stored", requiredControls: [] },
    artifacts: { "final_report.md": "ok" },
    agent: { id: "agent", name: "Agent" },
  });

  return {
    run: {
      runId,
      status: "VERIFIED",
      task,
      taskHash: sha256String(task),
      agentId: "agent",
      agentName: "Agent",
      projectId,
      projectName: projectId.toUpperCase(),
      capsuleHash: capsule.manifest.capsule_hash,
      walrusBlobId: `blob_${runId}`,
      suiCertificateId: `cert_${runId}`,
      suiTxDigest: `tx_${runId}`,
      blobMode: "local",
      certificateMode: "local",
      createdAt: now,
      updatedAt: now,
    },
    capsule,
    certificate: { certificateId: `cert_${runId}` },
  };
}

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), "wallbox-store-"));
  process.env.WALLBOX_SQLITE_PATH = path.join(tempDir, "wallbox.sqlite");
  process.env.WALLBOX_STORAGE_DIR = path.join(tempDir, "runs");
  closeRunStoreForTests();
});

afterEach(async () => {
  closeRunStoreForTests();
  delete process.env.WALLBOX_SQLITE_PATH;
  delete process.env.WALLBOX_STORAGE_DIR;
  if (tempDir) await rm(tempDir, { recursive: true, force: true });
});

describe("SQLite run store", () => {
  it("saves, loads, filters, and indexes runs", async () => {
    await saveRun(record("run_a", "agenthub"));
    await saveRun(record("run_b", "meridian"));

    await expect(loadRun("run_a")).resolves.toMatchObject({ run: { runId: "run_a", projectId: "agenthub" } });
    await expect(listRuns(10, { projectId: "agenthub" })).resolves.toHaveLength(1);
    await expect(findRunByCertificate("cert_run_b")).resolves.toMatchObject({ run: { runId: "run_b" } });
    await expect(findRunByCertificate("tx_run_b")).resolves.toMatchObject({ run: { runId: "run_b" } });
    await expect(findRunByBlob("blob_run_a")).resolves.toMatchObject({ run: { runId: "run_a" } });
  });
});
