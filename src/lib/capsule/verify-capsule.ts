import { AuditCapsuleSchema, FileCheck, VerificationStatus } from "./schema";
import type { AuditCapsule } from "./schema";
import { buildFileRecords } from "./build-capsule";
import { sha256CanonicalJson } from "./hash";

export type VerificationResult = {
  status: VerificationStatus;
  expectedHash: string;
  actualHash: string;
  fileChecks: FileCheck[];
  schemaErrors?: string[];
};

export function recomputeCapsuleHash(capsule: AuditCapsule): string {
  const manifestBase = { ...capsule.manifest, capsule_hash: undefined } as Record<string, unknown>;
  delete manifestBase.capsule_hash;
  return sha256CanonicalJson(manifestBase);
}

export function verifyCapsule(capsule: unknown, expectedHash?: string): VerificationResult {
  const parsed = AuditCapsuleSchema.safeParse(capsule);
  if (!parsed.success) {
    return {
      status: "INVALID_SCHEMA",
      expectedHash: expectedHash || "",
      actualHash: "",
      fileChecks: [],
      schemaErrors: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    };
  }

  const data = parsed.data;
  const expected = expectedHash || data.manifest.capsule_hash;
  const actualFiles = buildFileRecords({
    trace: data.trace,
    sources: data.sources,
    verdict: data.verdict,
    artifacts: data.artifacts,
  });

  const actualMap = new Map(actualFiles.map((f) => [f.path, f]));
  const manifestMap = new Map(data.manifest.files.map((f) => [f.path, f]));

  const fileChecks: FileCheck[] = data.manifest.files.map((file) => {
    const actualFile = actualMap.get(file.path);
    if (!actualFile) return { path: file.path, status: "MISSING", expectedSha256: file.sha256 };
    return {
      path: file.path,
      status: actualFile.sha256 === file.sha256 ? "OK" : "MISMATCH",
      sha256: actualFile.sha256,
      expectedSha256: file.sha256,
    };
  });

  for (const actualFile of actualFiles) {
    if (!manifestMap.has(actualFile.path)) {
      fileChecks.push({ path: actualFile.path, status: "EXTRA", sha256: actualFile.sha256 });
    }
  }

  const manifestBase = { ...data.manifest, files: actualFiles, capsule_hash: undefined } as Record<string, unknown>;
  delete manifestBase.capsule_hash;
  const actualHash = sha256CanonicalJson(manifestBase);
  const status = expected === actualHash && fileChecks.every((f) => f.status === "OK") ? "VERIFIED" : "TAMPERED";
  return { status, expectedHash: expected, actualHash, fileChecks };
}
