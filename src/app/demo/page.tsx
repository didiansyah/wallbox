import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, Box, CheckCircle2, Database, FileWarning, ShieldCheck } from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { listRuns, tamperRun, type WallboxRun } from "@/lib/storage/local-store";

export const dynamic = "force-dynamic";

type VerificationData = {
  status: string;
  certificate_id: string;
  sui_certificate_id?: string;
  sui_tx_digest?: string;
  walrus_blob_id?: string;
  onchain_capsule_hash?: string;
  recomputed_capsule_hash?: string;
  mode?: { blob?: "walrus" | "local"; certificate?: "sui-tatum" | "local" };
  files?: Array<{ path: string; status: string }>;
  error?: string;
};

async function appOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3070";
  const proto = h.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

async function verifyRun(run: WallboxRun): Promise<VerificationData | null> {
  const id = run.suiCertificateId || run.suiTxDigest;
  if (!id) return null;
  const res = await fetch(`${await appOrigin()}/api/verify/${id}`, { cache: "no-store" });
  if (!res.ok) return { status: "VERIFY_FAILED", certificate_id: id, error: await res.text() };
  return res.json();
}

function pickJudgeRun(runs: WallboxRun[]) {
  return runs.find((run) => run.status === "VERIFIED" && run.blobMode === "walrus" && run.certificateMode === "sui-tatum") || runs.find((run) => run.status === "VERIFIED") || runs[0];
}

function short(value?: string, head = 12, tail = 8) {
  if (!value) return "—";
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

function fmt(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
}

function suiObjectUrl(id?: string) {
  return id ? `https://suiexplorer.com/object/${id}?network=testnet` : "#";
}

function suiTxUrl(id?: string) {
  return id ? `https://suiexplorer.com/txblock/${id}?network=testnet` : "#";
}

function walrusUrl(blobId?: string) {
  const base = process.env.WALRUS_AGGREGATOR_URL?.replace(/\/+$/, "");
  return base && blobId ? `${base}/v1/blobs/${blobId}` : "#";
}

export default async function JudgeDemoPage() {
  async function tamperJudgeRun(formData: FormData) {
    "use server";
    const runId = String(formData.get("run_id") || "");
    if (runId) await tamperRun(runId);
    redirect(`/verify/local-tampered/${runId}`);
  }

  const runs = await listRuns(100);
  const run = pickJudgeRun(runs);
  const verification = run ? await verifyRun(run) : null;
  const hashMatch = verification?.onchain_capsule_hash && verification?.onchain_capsule_hash === verification?.recomputed_capsule_hash;
  const liveWalrus = run?.blobMode === "walrus";
  const liveSui = run?.certificateMode === "sui-tatum";
  const verifiedRuns = runs.filter((item) => item.status === "VERIFIED").length;

  return (
    <main className="wall-shell">
      <Header />
      <section className="wall-section wall-grid-bg">
        <div className="wall-container">
          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="wall-kicker">Judge demo</p>
              <h1 className="mt-3 max-w-5xl text-5xl font-normal tracking-[-.055em] text-[#e7eaeb] md:text-7xl">One screen proof that agent evidence was not tampered with.</h1>
              <p className="wall-copy mt-5 max-w-3xl">Wallbox stores the full audit capsule on Walrus, anchors its hash on Sui through Tatum, then recomputes the evidence hash during public verification.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/run" className="wall-button">Create fresh run</Link>
              {run?.suiCertificateId && <Link href={`/verify/${run.suiCertificateId}`} className="wall-button wall-button-primary">Open verifier</Link>}
            </div>
          </div>

          <div className="mb-5 grid gap-px border border-[#292f31] bg-[#292f31] md:grid-cols-4">
            <Metric label="Selected run" value={run ? short(run.runId, 10, 6) : "none"} />
            <Metric label="Verified runs" value={String(verifiedRuns)} />
            <Metric label="Walrus" value={liveWalrus ? "live" : "fallback"} />
            <Metric label="Sui/Tatum" value={liveSui ? "live" : "fallback"} />
          </div>

          {!run ? (
            <section className="wall-panel p-8">
              <p className="wall-kicker">No run yet</p>
              <h2 className="wall-h2 mt-4">Create the first audit capsule.</h2>
              <p className="wall-copy mt-5">The judge view will auto-load the latest verified run after a demo agent completes.</p>
              <Link href="/run" className="wall-button wall-button-primary mt-7">Run demo</Link>
            </section>
          ) : (
            <div className="grid gap-5">
              <section className="wall-panel overflow-hidden">
                <div className="grid gap-px bg-[#292f31] lg:grid-cols-[.9fr_1.1fr]">
                  <div className="bg-[#101618] p-6">
                    <p className="wall-kicker">Step 1 · Captured run</p>
                    <h2 className="mt-3 text-3xl font-normal tracking-[-.04em] text-[#e7eaeb]">{run.agentName}</h2>
                    <p className="wall-copy mt-4">{run.task}</p>
                    <div className="mt-5 grid gap-px border border-[#292f31] bg-[#292f31]">
                      <Field k="Run ID" v={run.runId} />
                      <Field k="Project" v={`${run.projectName || "Demo"} / ${run.projectId || "demo"}`} />
                      <Field k="Created" v={fmt(run.createdAt)} />
                    </div>
                  </div>
                  <div className="bg-[#101618] p-6">
                    <p className="wall-kicker">Step 2 · Stored and anchored</p>
                    <div className="mt-5 grid gap-px border border-[#292f31] bg-[#292f31]">
                      <ProofLink icon={<Database size={16} />} label="Walrus blob" value={run.walrusBlobId} href={walrusUrl(run.walrusBlobId)} />
                      <ProofLink icon={<ShieldCheck size={16} />} label="Sui certificate object" value={run.suiCertificateId} href={suiObjectUrl(run.suiCertificateId)} />
                      <ProofLink icon={<Box size={16} />} label="Sui tx digest" value={run.suiTxDigest} href={suiTxUrl(run.suiTxDigest)} />
                    </div>
                  </div>
                </div>
              </section>

              <section className="wall-panel p-6">
                <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="wall-kicker">Step 3 · Public verification</p>
                    <h2 className="mt-3 text-3xl font-normal tracking-[-.04em] text-[#e7eaeb]">{hashMatch ? "Hash match confirmed" : verification?.status || "Verification pending"}</h2>
                    <p className="wall-copy mt-3">The verifier fetches evidence, rebuilds canonical JSON, and compares it with the certificate hash.</p>
                  </div>
                  <span className={hashMatch ? "wall-status" : "wall-fig text-[#febb55]"}>{verification?.status || "UNKNOWN"}</span>
                </div>
                <div className="grid gap-px border border-[#292f31] bg-[#292f31] md:grid-cols-2">
                  <Field k="On-chain capsule hash" v={verification?.onchain_capsule_hash || run.capsuleHash || "missing"} />
                  <Field k="Recomputed capsule hash" v={verification?.recomputed_capsule_hash || "not available"} />
                  <Field k="Blob mode" v={verification?.mode?.blob || run.blobMode || "—"} />
                  <Field k="Certificate mode" v={verification?.mode?.certificate || run.certificateMode || "—"} />
                </div>
              </section>

              <section className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
                <div className="wall-panel p-6">
                  <p className="wall-kicker flex items-center gap-2"><CheckCircle2 size={16} /> File-level integrity</p>
                  <div className="mt-5 grid gap-px border border-[#292f31] bg-[#292f31]">
                    {(verification?.files || []).map((file) => (
                      <div key={file.path} className="flex flex-col justify-between gap-2 bg-[#0d1316] p-4 text-sm md:flex-row">
                        <span className="break-all text-[#b8bdbf]">{file.path}</span>
                        <span className={file.status === "OK" ? "wall-mono text-[#00d497]" : "wall-mono text-[#ff6785]"}>{file.status}</span>
                      </div>
                    ))}
                    {!verification?.files?.length && <p className="bg-[#0d1316] p-4 text-sm text-[#7e8385]">No file checks returned.</p>}
                  </div>
                </div>

                <div className="wall-panel p-6">
                  <p className="wall-kicker flex items-center gap-2"><FileWarning size={16} /> Tamper moment</p>
                  <h2 className="mt-3 text-3xl font-normal tracking-[-.04em] text-[#e7eaeb]">Make the proof fail.</h2>
                  <p className="wall-copy mt-4">This modifies the cached demo capsule and opens a verifier URL that should return `TAMPERED`.</p>
                  <form action={tamperJudgeRun} className="mt-6">
                    <input type="hidden" name="run_id" value={run.runId} />
                    <button className="wall-button wall-button-primary w-full justify-center" type="submit">Simulate tampering <ArrowRight size={15} /></button>
                  </form>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/capsules/${run.runId}`} className="wall-button min-h-0 px-3 py-2 text-[10px]">View capsule</Link>
                    {run.suiCertificateId && <Link href={`/verify/${run.suiCertificateId}`} className="wall-button min-h-0 px-3 py-2 text-[10px]">Verifier</Link>}
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0d1316] p-5">
      <p className="wall-mono text-[10px] uppercase tracking-[.14em] text-[#00d497]">{label}</p>
      <p className="mt-3 break-all text-3xl font-normal tracking-[-.04em] text-[#e7eaeb]">{value}</p>
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

function ProofLink({ icon, label, value, href }: { icon: React.ReactNode; label: string; value?: string; href: string }) {
  const disabled = href === "#";
  return (
    <div className="bg-[#0d1316] p-4">
      <p className="wall-mono flex items-center gap-2 text-[10px] uppercase tracking-[.14em] text-[#00d497]">{icon}{label}</p>
      {disabled ? (
        <p className="mt-2 break-all font-mono text-xs leading-5 text-[#b8bdbf]">{value || "not available"}</p>
      ) : (
        <a className="mt-2 block break-all font-mono text-xs leading-5 text-[#b8bdbf] underline decoration-[#236a4c] underline-offset-4 hover:text-[#e7eaeb]" href={href} target="_blank" rel="noreferrer">{value}</a>
      )}
    </div>
  );
}
