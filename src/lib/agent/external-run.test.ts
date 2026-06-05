import { describe, expect, it } from "vitest";
import { externalRunToPayload, ExternalRunSchema } from "@/lib/agent/external-run";
import { buildCapsuleFromPayload } from "@/lib/capsule/build-capsule";

const externalBody = {
  mode: "external" as const,
  task: "Audit my production research agent with api_key=secret-value",
  agent: { id: "research-agent", name: "Research Agent", version: "1.2.3" },
  model: { provider: "openai", name: "gpt-test", version: "2026-06" },
  trace: [{
    id: "step_001",
    type: "tool_call" as const,
    name: "fetch_source",
    startedAt: "2026-06-05T00:00:00.000Z",
    completedAt: "2026-06-05T00:00:01.000Z",
    inputHash: "hash-input",
    outputHash: "hash-output",
    summary: "Fetched one source.",
  }],
  sources: [{
    id: "src_001",
    type: "url" as const,
    label: "Source",
    uri: "https://example.com",
    accessedAt: "2026-06-05T00:00:01.000Z",
  }],
  artifacts: { "../final_report.md": "# Final report" },
};

describe("external run payload", () => {
  it("builds a capsule from a bring-your-own-agent submission", () => {
    const parsed = ExternalRunSchema.parse(externalBody);
    const payload = externalRunToPayload(parsed, "run_external_001");
    const capsule = buildCapsuleFromPayload(payload);

    expect(capsule.manifest.run_id).toBe("run_external_001");
    expect(capsule.manifest.agent.id).toBe("research-agent");
    expect(capsule.manifest.model.provider).toBe("openai");
    expect(capsule.manifest.task.plaintext_preview).toContain("[REDACTED]");
    expect(capsule.manifest.files.map((file) => file.path)).toContain("artifacts/final_report.md");
  });

  it("rejects external submissions without trace entries", () => {
    expect(() => ExternalRunSchema.parse({ ...externalBody, trace: [] })).toThrow();
  });
});
