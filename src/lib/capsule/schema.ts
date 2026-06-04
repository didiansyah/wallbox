import { z } from "zod";

export const ToolTraceEntrySchema = z.object({
  id: z.string(),
  type: z.enum(["tool_call", "model_step", "decision", "error"]),
  name: z.string(),
  inputHash: z.string().optional(),
  outputHash: z.string().optional(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  summary: z.string(),
});

export const SourceRecordSchema = z.object({
  id: z.string(),
  type: z.enum(["url", "file", "api", "chain_object"]),
  label: z.string(),
  uri: z.string(),
  sha256: z.string().optional(),
  accessedAt: z.string(),
});

export const VerdictSchema = z.object({
  verdict: z.string(),
  riskLevel: z.enum(["low", "medium", "high"]),
  summary: z.string(),
  requiredControls: z.array(z.string()),
});

export const ManifestFileSchema = z.object({ path: z.string(), sha256: z.string(), bytes: z.number() });

export const AuditManifestSchema = z.object({
  schema_version: z.literal("wallbox.audit_capsule.v1"),
  run_id: z.string(),
  agent: z.object({ id: z.string(), name: z.string(), version: z.string() }),
  model: z.object({ provider: z.string(), name: z.string(), version: z.string() }),
  task: z.object({ plaintext_preview: z.string(), sha256: z.string() }),
  policy: z.object({ system_prompt_sha256: z.string(), policy_version: z.string() }),
  timing: z.object({ started_at: z.string(), completed_at: z.string() }),
  files: z.array(ManifestFileSchema),
  capsule_hash: z.string(),
});

export const AuditCapsuleSchema = z.object({
  manifest: AuditManifestSchema,
  trace: z.array(ToolTraceEntrySchema),
  sources: z.array(SourceRecordSchema),
  verdict: VerdictSchema,
  artifacts: z.record(z.string(), z.string()),
});

export type ToolTraceEntry = z.infer<typeof ToolTraceEntrySchema>;
export type SourceRecord = z.infer<typeof SourceRecordSchema>;
export type VerdictRecord = z.infer<typeof VerdictSchema>;
export type AuditManifest = z.infer<typeof AuditManifestSchema>;
export type AuditCapsule = z.infer<typeof AuditCapsuleSchema>;
export type FileCheck = {
  path: string;
  status: "OK" | "MISSING" | "MISMATCH" | "EXTRA";
  sha256?: string;
  expectedSha256?: string;
};
export type VerificationStatus = "VERIFIED" | "TAMPERED" | "INVALID_SCHEMA" | "MISSING_BLOB" | "CERTIFICATE_NOT_FOUND";
