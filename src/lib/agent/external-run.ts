import { z } from "zod";
import { ToolTraceEntrySchema, SourceRecordSchema, VerdictSchema } from "@/lib/capsule/schema";
import type { CapsuleRunPayload } from "@/lib/capsule/build-capsule";

const AgentSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().min(1).max(160),
  version: z.string().min(1).max(80).optional(),
});

const ModelSchema = z.object({
  provider: z.string().min(1).max(120),
  name: z.string().min(1).max(160),
  version: z.string().min(1).max(80).optional(),
});

const PolicySchema = z.object({
  version: z.string().min(1).max(120).optional(),
  system_prompt: z.string().max(20_000).optional(),
  system_prompt_sha256: z.string().min(16).max(128).optional(),
});

export const ExternalRunSchema = z.object({
  mode: z.literal("external").optional(),
  run_id: z.string().min(3).max(120).regex(/^[a-zA-Z0-9_.:-]+$/).optional(),
  task: z.string().min(1).max(8_000),
  started_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
  agent: AgentSchema,
  model: ModelSchema.optional(),
  policy: PolicySchema.optional(),
  trace: z.array(ToolTraceEntrySchema).min(1).max(500),
  sources: z.array(SourceRecordSchema).max(250).default([]),
  verdict: VerdictSchema.optional(),
  artifacts: z.record(z.string().min(1).max(180), z.string().max(300_000)).default({}),
});

export type ExternalRunInput = z.infer<typeof ExternalRunSchema>;

export function externalRunToPayload(input: ExternalRunInput, fallbackRunId: string): CapsuleRunPayload {
  const now = new Date().toISOString();
  return {
    runId: input.run_id ?? fallbackRunId,
    task: input.task,
    startedAt: input.started_at ?? input.trace[0]?.startedAt ?? now,
    completedAt: input.completed_at ?? input.trace.at(-1)?.completedAt ?? now,
    trace: input.trace,
    sources: input.sources,
    verdict: input.verdict ?? {
      verdict: "External agent run captured for integrity verification.",
      riskLevel: "medium",
      summary: "Wallbox records the submitted trace, sources, artifacts, and task hash. Verification proves integrity of this evidence, not real-world truth.",
      requiredControls: ["instrument agent runtime", "submit tool trace", "redact raw secrets", "verify certificate before relying on output"],
    },
    artifacts: Object.keys(input.artifacts).length ? input.artifacts : { "summary.md": "External run captured by Wallbox. No artifact body was submitted." },
    agent: input.agent,
    model: input.model ?? { provider: "external", name: "bring-your-own-agent", version: "unknown" },
    policy: input.policy ? { version: input.policy.version, systemPrompt: input.policy.system_prompt, systemPromptSha256: input.policy.system_prompt_sha256 } : { version: "external-policy" },
  };
}
