import { describe, expect, it } from "vitest";
import { DEMO_TASK, runDemoAgent } from "./demo-agent";

describe("runDemoAgent", () => {
  it("produces deterministic trace, sources, verdict, and report", () => {
    const first = runDemoAgent("run_agent_001", DEMO_TASK);
    const second = runDemoAgent("run_agent_001", DEMO_TASK);

    expect(first).toEqual(second);
    expect(first.trace).toHaveLength(5);
    expect(first.sources).toHaveLength(3);
    expect(first.verdict.riskLevel).toBe("high");
    expect(first.finalReport).toContain("Wallbox run run_agent_001");
  });
});
