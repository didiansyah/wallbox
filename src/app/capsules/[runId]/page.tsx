import Link from "next/link";
import { headers } from "next/headers";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

type RunData = {
  runId: string;
  agentName: string;
  capsuleHash: string;
  walrusBlobId: string;
  suiCertificateId: string;
  manifest: { schema_version: string };
  trace: Array<{ id: string; name: string; summary: string }>;
  sources: Array<{ id: string; label: string; uri: string }>;
  artifacts: Record<string, string>;
};

async function appOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3070";
  const proto = h.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

async function getRun(runId: string): Promise<RunData | null> {
  const res = await fetch(`${await appOrigin()}/api/runs/${runId}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function CapsulePage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const run = await getRun(runId);

  return (
    <main className="wall-shell">
      <Header />
      <section className="wall-section wall-grid-bg">
        <div className="wall-container">
          {!run ? (
            <div className="wall-panel p-8">
              <p className="wall-kicker">Audit capsule</p>
              <h1 className="wall-h2 mt-4">Run not found.</h1>
              <Link href="/run" className="wall-button wall-button-primary mt-6">Run demo</Link>
            </div>
          ) : (
            <>
              <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <p className="wall-kicker">Audit capsule</p>
                  <h1 className="mt-3 break-all text-4xl font-normal tracking-[-.045em] text-[#e7eaeb] md:text-6xl">{run.runId}</h1>
                  <p className="wall-copy mt-4">Captured evidence bundle for {run.agentName}.</p>
                </div>
                <Link className="wall-button wall-button-primary" href={`/verify/${run.suiCertificateId}`}>Verify</Link>
              </div>

              <div className="grid gap-px border border-[#292f31] bg-[#292f31] lg:grid-cols-[.8fr_1.2fr]">
                <section className="bg-[#101618] p-6">
                  <h2 className="wall-kicker">Manifest</h2>
                  <div className="mt-5 grid gap-px border border-[#292f31] bg-[#292f31]">
                    <Row k="Capsule hash" v={run.capsuleHash} />
                    <Row k="Walrus blob" v={run.walrusBlobId} />
                    <Row k="Sui certificate" v={run.suiCertificateId} />
                    <Row k="Schema" v={run.manifest.schema_version} />
                  </div>
                </section>

                <section className="bg-[#101618] p-6">
                  <h2 className="wall-kicker">Trace</h2>
                  <div className="mt-5 grid gap-3">
                    {run.trace.map((t) => (
                      <div key={t.id} className="border border-[#292f31] bg-[#0d1316] p-4">
                        <p className="text-sm font-medium text-[#e7eaeb]">{t.name}</p>
                        <p className="mt-2 text-sm leading-6 text-[#7e8385]">{t.summary}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-[#101618] p-6">
                  <h2 className="wall-kicker">Sources</h2>
                  <div className="mt-5 grid gap-3">
                    {run.sources.map((s) => (
                      <div key={s.id} className="border border-[#292f31] bg-[#0d1316] p-4 text-sm">
                        <p className="text-[#e7eaeb]">{s.label}</p>
                        <p className="mt-2 break-all font-mono text-xs text-[#7e8385]">{s.uri}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-[#101618] p-6">
                  <h2 className="wall-kicker">Artifacts</h2>
                  <div className="mt-5 grid gap-3">
                    {Object.entries(run.artifacts).map(([path, content]) => (
                      <div key={path} className="border border-[#292f31] bg-[#0d1316] p-4">
                        <p className="wall-mono text-[10px] uppercase tracking-[.14em] text-[#00d497]">{path}</p>
                        <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-5 text-[#b8bdbf]">{content}</pre>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-[#0d1316] p-4">
      <p className="wall-mono text-[10px] uppercase tracking-[.14em] text-[#00d497]">{k}</p>
      <p className="mt-2 break-all font-mono text-xs text-[#b8bdbf]">{v}</p>
    </div>
  );
}
