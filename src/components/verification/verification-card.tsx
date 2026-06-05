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

const baseMessages: Record<string, [string, typeof CheckCircle2, string]> = {
  VERIFIED: ["#00d497", CheckCircle2, "Integrity verified. The audit capsule matches the certificate hash."],
  TAMPERED: ["#ff6785", XCircle, "Verification failed. The capsule contents no longer match the anchored hash."],
  MISSING_BLOB: ["#febb55", AlertTriangle, "The certificate exists, but the referenced evidence blob could not be fetched."],
  INVALID_SCHEMA: ["#febb55", AlertTriangle, "The capsule does not match the Wallbox audit schema."],
  CERTIFICATE_NOT_FOUND: ["#febb55", AlertTriangle, "No certificate was found for this identifier."],
};

function modeCopy(data: VerificationData) {
  const blob = data.mode?.blob === "walrus" ? "Walrus testnet" : "local evidence fallback";
  const certificate = data.mode?.certificate === "sui-tatum" ? "Sui/Tatum testnet" : "local certificate fallback";
  return `${blob} · ${certificate}`;
}

function hashLabel(data: VerificationData) {
  return data.mode?.certificate === "sui-tatum" ? "On-chain hash" : "Anchored hash";
}

export function VerificationCard({ data }: { data: VerificationData }) {
  const s = baseMessages[data.status] || baseMessages.INVALID_SCHEMA;
  const Icon = s[1];
  const isLocal = data.mode?.blob === "local" || data.mode?.certificate === "local";

  return (
    <div className="grid gap-5">
      <section className="wall-panel p-6">
        <div className="flex items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center border" style={{ borderColor: s[0], color: s[0], background: `${s[0]}1A` }}>
            <Icon size={28} />
          </div>
          <div>
            <p className="wall-kicker" style={{ color: s[0] }}>{data.status}</p>
            <h1 className="mt-2 text-4xl font-normal tracking-[-.045em] text-[#e7eaeb]">Certificate verification</h1>
            <p className="mt-3 max-w-3xl text-[#b8bdbf]">{s[2]}</p>
            {isLocal && <p className="wall-fig mt-4 text-[#febb55]">Local demo mode: fallback storage/certificate</p>}
          </div>
        </div>
      </section>

      <section className="wall-panel p-6">
        <h2 className="wall-kicker">Hash comparison</h2>
        <div className="mt-4 grid gap-px border border-[#292f31] bg-[#292f31] md:grid-cols-2">
          <Field k={hashLabel(data)} v={data.onchain_capsule_hash || data.error || "missing"} />
          <Field k="Recomputed hash" v={data.recomputed_capsule_hash || "not available"} />
          <Field k="Evidence blob" v={data.walrus_blob_id || "not available"} />
          <Field k="Certificate" v={data.sui_certificate_id || data.certificate_id} />
          <Field k="Runtime mode" v={modeCopy(data)} />
        </div>
      </section>

      <section className="wall-panel p-6">
        <h2 className="wall-kicker flex items-center gap-2"><FileCheck2 size={17} />File integrity checklist</h2>
        <div className="mt-4 grid gap-px border border-[#292f31] bg-[#292f31]">
          {(data.files || []).map((f) => (
            <div key={f.path} className="flex flex-col justify-between gap-2 bg-[#0d1316] p-3 text-sm md:flex-row">
              <span className="text-[#b8bdbf]">{f.path}</span>
              <span className={f.status === "OK" ? "wall-mono text-[#00d497]" : "wall-mono text-[#ff6785]"}>{f.status}</span>
            </div>
          ))}
          {!data.files?.length && <p className="bg-[#0d1316] p-4 text-sm text-[#7e8385]">No file checks available.</p>}
        </div>
      </section>

      {data.capsule?.artifacts?.["final_report.md"] && (
        <section className="wall-panel p-6">
          <h2 className="wall-kicker">Artifact preview</h2>
          <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap border border-[#292f31] bg-[#080f11] p-4 text-sm leading-6 text-[#b8bdbf]">
            {data.capsule.artifacts["final_report.md"]}
          </pre>
        </section>
      )}
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-[#0d1316] p-4">
      <p className="wall-mono text-[10px] uppercase tracking-[.14em] text-[#00d497]">{k}</p>
      <p className="mt-2 break-all font-mono text-xs leading-5 text-[#b8bdbf]">{v}</p>
    </div>
  );
}
