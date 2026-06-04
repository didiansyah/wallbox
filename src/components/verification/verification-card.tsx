import { AlertTriangle, CheckCircle2, FileCheck2, XCircle } from "lucide-react";

type VerificationData = {
  status: string;
  certificate_id: string;
  sui_certificate_id?: string;
  walrus_blob_id?: string;
  onchain_capsule_hash?: string;
  recomputed_capsule_hash?: string;
  error?: string;
  mode?: { blob?: "walrus" | "local"; certificate?: "sui-tatum" | "local" };
  files?: Array<{ path: string; status: string; sha256?: string }>;
  capsule?: { artifacts?: Record<string, string> };
};

const baseMessages: Record<string, [string, string, typeof CheckCircle2, string]> = {
  VERIFIED: [
    "text-green-700",
    "bg-green-50 border-green-200",
    CheckCircle2,
    "Integrity verified. The audit capsule matches the certificate hash.",
  ],
  TAMPERED: [
    "text-red-700",
    "bg-red-50 border-red-200",
    XCircle,
    "Verification failed. The capsule contents no longer match the anchored hash.",
  ],
  MISSING_BLOB: [
    "text-amber-700",
    "bg-amber-50 border-amber-200",
    AlertTriangle,
    "The certificate exists, but the referenced evidence blob could not be fetched.",
  ],
  INVALID_SCHEMA: [
    "text-amber-700",
    "bg-amber-50 border-amber-200",
    AlertTriangle,
    "The capsule does not match the Wallbox audit schema.",
  ],
  CERTIFICATE_NOT_FOUND: [
    "text-amber-700",
    "bg-amber-50 border-amber-200",
    AlertTriangle,
    "No certificate was found for this identifier.",
  ],
};

function modeCopy(data: VerificationData) {
  const blob = data.mode?.blob === "walrus" ? "Walrus live" : "local evidence fallback";
  const certificate = data.mode?.certificate === "sui-tatum" ? "Sui/Tatum live" : "local certificate fallback";
  return `${blob} · ${certificate}`;
}

function hashLabel(data: VerificationData) {
  return data.mode?.certificate === "sui-tatum" ? "On-chain hash" : "Anchored hash";
}

export function VerificationCard({ data }: { data: VerificationData }) {
  const s = baseMessages[data.status] || baseMessages.INVALID_SCHEMA;
  const Icon = s[2];
  const isLocal = data.mode?.blob === "local" || data.mode?.certificate === "local";

  return (
    <div className="grid gap-5">
      <section className={`rounded-2xl border p-6 ${s[1]}`}>
        <div className="flex items-start gap-4">
          <Icon className={s[0]} size={32} />
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[.2em] ${s[0]}`}>{data.status}</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#111111]">Certificate verification</h1>
            <p className="mt-2 max-w-3xl text-[#4a3d34]">{s[3]}</p>
            {isLocal && (
              <p className="mt-3 inline-flex rounded-full border border-[#faae40]/40 bg-[#fff7ed] px-3 py-1 text-xs font-semibold text-[#8a4b0f]">
                Local demo mode: same verification interface, fallback storage/certificate.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold">Hash comparison</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field k={hashLabel(data)} v={data.onchain_capsule_hash || data.error || "missing"} />
          <Field k="Recomputed hash" v={data.recomputed_capsule_hash || "not available"} />
          <Field k="Evidence blob" v={data.walrus_blob_id || "not available"} />
          <Field k="Certificate" v={data.sui_certificate_id || data.certificate_id} />
          <Field k="Runtime mode" v={modeCopy(data)} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-semibold"><FileCheck2 size={18} className="text-primary" />File integrity checklist</h2>
        <div className="mt-4 grid gap-2">
          {(data.files || []).map((f) => (
            <div key={f.path} className="flex flex-col justify-between gap-2 rounded-xl border border-border bg-secondary p-3 text-sm md:flex-row">
              <span>{f.path}</span>
              <span className={f.status === "OK" ? "text-green-700" : "text-red-700"}>{f.status}</span>
            </div>
          ))}
          {!data.files?.length && <p className="text-sm text-muted-foreground">No file checks available.</p>}
        </div>
      </section>

      {data.capsule?.artifacts?.["final_report.md"] && (
        <section className="rounded-2xl border border-border bg-[#111111] p-6 text-[#fff7ed]">
          <h2 className="font-semibold">Artifact preview</h2>
          <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap text-sm leading-6 text-white/75">
            {data.capsule.artifacts["final_report.md"]}
          </pre>
        </section>
      )}
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[.16em] text-primary">{k}</p>
      <p className="break-all font-mono text-sm text-muted-foreground">{v}</p>
    </div>
  );
}
