import { AuditCapsule, SourceRecord, ToolTraceEntry, VerdictRecord } from "./schema";
import { canonicalJson, sha256CanonicalJson, sha256String } from "./hash";

export type DemoRunPayload = { runId:string; task:string; startedAt:string; completedAt:string; trace:ToolTraceEntry[]; sources:SourceRecord[]; verdict:VerdictRecord; finalReport:string };

function bytes(s: string) { return Buffer.byteLength(s, "utf8"); }
export function buildFileRecords(payload: Omit<AuditCapsule, "manifest">) {
  return [
    { path:"trace.jsonl", content: payload.trace.map((entry) => canonicalJson(entry)).join("\n") + "\n" },
    { path:"sources.json", content: canonicalJson(payload.sources) },
    { path:"verdict.json", content: canonicalJson(payload.verdict) },
    ...Object.entries(payload.artifacts).sort(([a],[b])=>a.localeCompare(b)).map(([path, content]) => ({ path:`artifacts/${path}`, content })),
  ].map((file) => ({ path:file.path, sha256:sha256String(file.content), bytes:bytes(file.content) }));
}
export function buildCapsule(input: DemoRunPayload): AuditCapsule {
  const partial = { trace: input.trace, sources: input.sources, verdict: input.verdict, artifacts: { "final_report.md": input.finalReport } };
  const files = buildFileRecords(partial);
  const manifestBase = { schema_version:"wallbox.audit_capsule.v1" as const, run_id:input.runId, agent:{ id:"risklens-demo-agent", name:"RiskLens Demo Agent", version:"0.1.0" }, model:{ provider:"demo", name:"deterministic-demo-agent", version:"0.1.0" }, task:{ plaintext_preview: input.task, sha256: sha256String(input.task) }, policy:{ system_prompt_sha256: sha256String("wallbox-demo-policy-v1: record trace, redact secrets, verify integrity"), policy_version:"wallbox-demo-policy-v1" }, timing:{ started_at:input.startedAt, completed_at:input.completedAt }, files };
  const capsule_hash = sha256CanonicalJson(manifestBase);
  return { manifest: { ...manifestBase, capsule_hash }, ...partial };
}
