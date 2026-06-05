import { AuditCapsule, SourceRecord, ToolTraceEntry, VerdictRecord } from "./schema";
import { canonicalJson, sha256CanonicalJson, sha256String } from "./hash";
import { redactPublicText } from "./redaction";

export type CapsuleRunPayload = {
  runId: string;
  task: string;
  startedAt: string;
  completedAt: string;
  trace: ToolTraceEntry[];
  sources: SourceRecord[];
  verdict: VerdictRecord;
  artifacts: Record<string, string>;
  agent?: { id: string; name: string; version?: string };
  model?: { provider: string; name: string; version?: string };
  policy?: { systemPrompt?: string; systemPromptSha256?: string; version?: string };
};

export type DemoRunPayload = Omit<CapsuleRunPayload, "artifacts" | "agent" | "model" | "policy"> & { finalReport: string };

function bytes(s: string) { return Buffer.byteLength(s, "utf8"); }
function safeArtifactPath(path: string) {
  return path
    .split(/[\\/]+/)
    .filter((part) => part && part !== "." && part !== "..")
    .join("/")
    .slice(0, 160) || "artifact.txt";
}
export function buildFileRecords(payload: Omit<AuditCapsule, "manifest">) {
  return [
    { path:"trace.jsonl", content: payload.trace.map((entry) => canonicalJson(entry)).join("\n") + "\n" },
    { path:"sources.json", content: canonicalJson(payload.sources) },
    { path:"verdict.json", content: canonicalJson(payload.verdict) },
    ...Object.entries(payload.artifacts).sort(([a],[b])=>a.localeCompare(b)).map(([path, content]) => ({ path:`artifacts/${safeArtifactPath(path)}`, content })),
  ].map((file) => ({ path:file.path, sha256:sha256String(file.content), bytes:bytes(file.content) }));
}

export function buildCapsuleFromPayload(input: CapsuleRunPayload): AuditCapsule {
  const partial = { trace: input.trace, sources: input.sources, verdict: input.verdict, artifacts: input.artifacts };
  const files = buildFileRecords(partial);
  const agent = input.agent ?? { id:"risklens-demo-agent", name:"RiskLens Demo Agent", version:"0.1.0" };
  const model = input.model ?? { provider:"demo", name:"deterministic-demo-agent", version:"0.1.0" };
  const policyVersion = input.policy?.version ?? "wallbox-demo-policy-v1";
  const policyHash = input.policy?.systemPromptSha256 ?? sha256String(input.policy?.systemPrompt ?? "wallbox-demo-policy-v1: record trace, redact secrets, verify integrity");
  const manifestBase = {
    schema_version:"wallbox.audit_capsule.v1" as const,
    run_id:input.runId,
    agent:{ id:agent.id, name:agent.name, version:agent.version ?? "0.1.0" },
    model:{ provider:model.provider, name:model.name, version:model.version ?? "unknown" },
    task:{ plaintext_preview: redactPublicText(input.task), sha256: sha256String(input.task) },
    policy:{ system_prompt_sha256: policyHash, policy_version:policyVersion },
    timing:{ started_at:input.startedAt, completed_at:input.completedAt },
    files
  };
  const capsule_hash = sha256CanonicalJson(manifestBase);
  return { manifest: { ...manifestBase, capsule_hash }, ...partial };
}

export function buildCapsule(input: DemoRunPayload): AuditCapsule {
  return buildCapsuleFromPayload({ ...input, artifacts: { "final_report.md": input.finalReport } });
}
