import { describe, expect, it } from "vitest";
import { runDemoAgent } from "@/lib/agent/demo-agent";
import { buildCapsule } from "./build-capsule";
import { verifyCapsule } from "./verify-capsule";

describe("capsule verification", () => {
  it("verifies a fresh deterministic capsule", () => {
    const capsule = buildCapsule(runDemoAgent("run_test_001"));
    expect(verifyCapsule(capsule).status).toBe("VERIFIED");
  });
  it("detects tampered artifact content", () => {
    const capsule = buildCapsule(runDemoAgent("run_test_002"));
    capsule.artifacts["final_report.md"] += "tamper";
    const result = verifyCapsule(capsule);
    expect(result.status).toBe("TAMPERED");
    expect(result.fileChecks.some((f) => f.status === "MISMATCH")).toBe(true);
  });

  it("detects extra artifacts that were not in the original manifest", () => {
    const capsule = buildCapsule(runDemoAgent("run_test_003"));
    capsule.artifacts["secret_extra.md"] = "this file was inserted after certification";
    const result = verifyCapsule(capsule);
    expect(result.status).toBe("TAMPERED");
    expect(result.fileChecks).toContainEqual(
      expect.objectContaining({ path: "artifacts/secret_extra.md", status: "EXTRA" }),
    );
  });
});
