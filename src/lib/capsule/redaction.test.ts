import { describe, expect, it } from "vitest";
import { buildCapsule } from "./build-capsule";
import { runDemoAgent } from "@/lib/agent/demo-agent";
import { redactPublicText } from "./redaction";

describe("public capsule redaction", () => {
  it("redacts common credentials from text stored in public capsules", () => {
    const input = "Investigate api_key=sk_live_1234567890abcdef and Authorization: Bearer secret-token-1234567890";

    const redacted = redactPublicText(input);

    expect(redacted).not.toContain("sk_live_1234567890abcdef");
    expect(redacted).not.toContain("secret-token-1234567890");
    expect(redacted).toContain("api_key=[REDACTED]");
    expect(redacted).toContain("Authorization: Bearer [REDACTED]");
  });

  it("stores only redacted task previews while preserving the raw task hash", () => {
    const task = "Check Sui wallet using private_key=suiprivkey_super_secret_token_123 and continue.";
    const agentRun = runDemoAgent("run_redaction_test", task);

    const capsule = buildCapsule(agentRun);

    expect(capsule.manifest.task.plaintext_preview).toContain("private_key=[REDACTED]");
    expect(capsule.manifest.task.plaintext_preview).not.toContain("suiprivkey_super_secret_token_123");
    expect(capsule.manifest.task.sha256).toMatch(/^0x[a-f0-9]{64}$/);
  });
});
