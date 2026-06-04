import { describe, expect, it } from "vitest";
import { buildCapsule } from "@/lib/capsule/build-capsule";
import { runDemoAgent } from "@/lib/agent/demo-agent";

describe("buildCapsule", () => {
  it("builds a deterministic capsule hash for the same run payload", () => {
    const payload = runDemoAgent("run_stable_001");
    const first = buildCapsule(payload);
    const second = buildCapsule(payload);

    expect(first.manifest.capsule_hash).toBe(second.manifest.capsule_hash);
    expect(first.manifest.files.map((file) => file.path)).toEqual([
      "trace.jsonl",
      "sources.json",
      "verdict.json",
      "artifacts/final_report.md",
    ]);
  });

  it("changes the capsule hash when artifact content changes", () => {
    const payload = runDemoAgent("run_stable_002");
    const first = buildCapsule(payload);
    const second = buildCapsule({ ...payload, finalReport: `${payload.finalReport}\nTampered line` });

    expect(first.manifest.capsule_hash).not.toBe(second.manifest.capsule_hash);
  });
});
