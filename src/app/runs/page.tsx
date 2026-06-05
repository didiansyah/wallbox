import Link from "next/link";
import { headers } from "next/headers";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import type { WallboxRun } from "@/lib/storage/local-store";

type RunsResponse = { runs: WallboxRun[]; count: number };

async function appOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3070";
  const proto = h.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

async function getRuns(): Promise<WallboxRun[]> {
  const res = await fetch(`${await appOrigin()}/api/runs?limit=100`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as RunsResponse;
  return data.runs || [];
}

function short(value?: string, head = 10, tail = 6) {
  if (!value) return "—";
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

function fmt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export default async function RunsPage() {
  const runs = await getRuns();
  const verified = runs.filter((run) => run.status === "VERIFIED").length;
  const liveWalrus = runs.filter((run) => run.blobMode === "walrus").length;
  const liveSui = runs.filter((run) => run.certificateMode === "sui-tatum").length;

  return (
    <main className="wall-shell">
      <Header />
      <section className="wall-section wall-grid-bg">
        <div className="wall-container">
          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="wall-kicker">Run history</p>
              <h1 className="mt-3 text-5xl font-normal tracking-[-.055em] text-[#e7eaeb] md:text-7xl">Audit runs</h1>
              <p className="wall-copy mt-4">Recent Wallbox capsules with Sui certificates, Walrus blobs, and public verifier links.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/integrations" className="wall-button">Integrate agent</Link>
              <Link href="/run" className="wall-button wall-button-primary">Run demo</Link>
            </div>
          </div>

          <div className="mb-5 grid gap-px border border-[#292f31] bg-[#292f31] md:grid-cols-4">
            <Metric label="Total runs" value={String(runs.length)} />
            <Metric label="Verified" value={String(verified)} />
            <Metric label="Walrus live" value={String(liveWalrus)} />
            <Metric label="Sui live" value={String(liveSui)} />
          </div>

          {runs.length === 0 ? (
            <section className="wall-panel p-8">
              <p className="wall-kicker">Empty store</p>
              <h2 className="wall-h2 mt-4">No runs captured yet.</h2>
              <p className="wall-copy mt-5">Run the demo or submit an external agent trace to create the first audit capsule.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/run" className="wall-button wall-button-primary">Run demo</Link>
                <Link href="/integrations" className="wall-button">Read integrations</Link>
              </div>
            </section>
          ) : (
            <section className="border border-[#292f31] bg-[#101618]">
              <div className="hidden grid-cols-[1.1fr_.75fr_.55fr_.7fr_.8fr] gap-px border-b border-[#292f31] bg-[#292f31] text-[10px] uppercase tracking-[.14em] text-[#7e8385] wall-mono lg:grid">
                <HeaderCell>Run</HeaderCell>
                <HeaderCell>Agent</HeaderCell>
                <HeaderCell>Status</HeaderCell>
                <HeaderCell>Created</HeaderCell>
                <HeaderCell>Actions</HeaderCell>
              </div>
              <div className="grid gap-px bg-[#292f31]">
                {runs.map((run) => (
                  <article key={run.runId} className="grid gap-4 bg-[#0d1316] p-5 lg:grid-cols-[1.1fr_.75fr_.55fr_.7fr_.8fr] lg:items-center lg:gap-px">
                    <div>
                      <p className="wall-mono break-all text-xs text-[#e7eaeb]">{run.runId}</p>
                      <p className="mt-2 break-all font-mono text-[11px] text-[#7e8385]">{short(run.capsuleHash, 18, 10)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#e7eaeb]">{run.agentName}</p>
                      <p className="mt-2 font-mono text-[11px] text-[#7e8385]">{run.agentId}</p>
                    </div>
                    <div>
                      <span className={run.status === "VERIFIED" ? "wall-status" : "wall-fig text-[#febb55]"}>{run.status}</span>
                      <p className="mt-2 font-mono text-[11px] text-[#7e8385]">{run.blobMode || "—"} / {run.certificateMode || "—"}</p>
                    </div>
                    <div className="font-mono text-xs text-[#b8bdbf]">{fmt(run.createdAt)}</div>
                    <div className="flex flex-wrap gap-2">
                      {run.suiCertificateId && <Link href={`/verify/${run.suiCertificateId}`} className="wall-button min-h-0 px-3 py-2 text-[10px]">Verify</Link>}
                      <Link href={`/capsules/${run.runId}`} className="wall-button min-h-0 px-3 py-2 text-[10px]">Capsule</Link>
                      {run.suiTxDigest && <Link href={`/verify/${run.suiTxDigest}`} className="wall-button min-h-0 px-3 py-2 text-[10px]">Tx</Link>}
                    </div>
                  </article>
                ))}
              </div>
            </section>
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
      <p className="mt-3 text-4xl font-normal tracking-[-.04em] text-[#e7eaeb]">{value}</p>
    </div>
  );
}

function HeaderCell({ children }: { children: React.ReactNode }) {
  return <div className="bg-[#101618] p-4">{children}</div>;
}
