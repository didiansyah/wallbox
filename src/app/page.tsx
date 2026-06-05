import Link from "next/link";
import { ArrowRight, CheckCircle2, Cpu, FileSearch, LockKeyhole, Network, RadioTower, Server, ShieldCheck } from "lucide-react";
import { Header } from "@/components/landing/header";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { HowItWorks } from "@/components/landing/how-it-works";

const featureCards = [
  { title: "Deterministic recorder", icon: Cpu, body: "A predictable RiskLens agent run captures the task, policy, tool trace, sources, verdict, and report output." },
  { title: "Walrus evidence store", icon: Server, body: "Full audit capsules are stored as public testnet blobs, not just media or metadata placeholders." },
  { title: "Sui certificate anchor", icon: ShieldCheck, body: "A Move object stores the run ID, blob ID, schema, and capsule hash for independent verification." },
  { title: "Public verifier", icon: FileSearch, body: "Anyone can fetch the certificate, retrieve the capsule, recompute hashes, and detect tampering." },
];

const useCases = ["AI trading agents", "Research copilots", "Coding agents", "Compliance reviews", "DAO operations", "Enterprise automation"];

export default function Home() {
  return (
    <main className="wall-shell">
      <Header />

      <section className="wall-section wall-grid-bg wall-dot-bg border-b border-border">
        <div className="wall-container relative grid gap-14 lg:grid-cols-[1.02fr_.98fr] lg:items-center">
          <div className="relative z-10">
            <div className="mb-7 flex flex-wrap items-center gap-3">
              <span className="wall-status">Testnet live</span>
              <span className="wall-fig">Walrus + Sui + Tatum</span>
            </div>
            <h1 className="wall-title max-w-4xl">The black box <span className="muted">for autonomous AI agents.</span></h1>
            <p className="wall-copy mt-7">
              Wallbox records every agent run as a tamper-evident audit capsule, stores the evidence on Walrus, and anchors a verification certificate on Sui through Tatum.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/run" className="wall-button wall-button-primary">Run demo agent <ArrowRight size={15} /></Link>
              <Link href="/verify/local-demo" className="wall-button">Verify certificate</Link>
            </div>
            <div className="mt-10 grid max-w-2xl gap-px border border-[#292f31] bg-[#292f31] sm:grid-cols-3">
              {[
                [CheckCircle2, "Canonical hashing"],
                [LockKeyhole, "Public tamper proof"],
                [Network, "Testnet chain of custody"],
              ].map(([Icon, label]) => (
                <div key={String(label)} className="flex items-center gap-3 bg-[#101618] p-4 text-sm text-[#b8bdbf]">
                  <Icon className="text-[#00d497]" size={17} /> {String(label)}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-8 -top-10 hidden text-[#00d497]/20 lg:block"><RadioTower size={160} /></div>
            <DashboardPreview />
            <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[.14em] text-[#4d5558] wall-mono">
              <span>FIG. 01 Wallbox verifier</span>
              <span>Integrity, not truth</span>
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="wall-section border-b border-border bg-[#080f11]">
        <div className="wall-container grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <p className="wall-kicker">Problem</p>
            <h2 className="wall-h2 mt-4">AI agents act. <span className="muted">Logs can be rewritten.</span></h2>
          </div>
          <div className="wall-panel p-7">
            <p className="wall-copy">
              When an agent trades, browses, writes code, or makes a recommendation, users need evidence: what prompt was active, which tools ran, what sources were read, and whether the resulting artifacts changed after the run.
            </p>
            <div className="mt-8 grid gap-3 wall-code">
              <div className="border border-[#292f31] bg-[#0d1316] p-3"><span className="text-[#00d497]">$</span> capture trace.jsonl / sources.json / verdict.json</div>
              <div className="border border-[#292f31] bg-[#0d1316] p-3"><span className="text-[#00d497]">$</span> publish capsule → walrus://testnet/blob</div>
              <div className="border border-[#292f31] bg-[#0d1316] p-3"><span className="text-[#00d497]">$</span> anchor hash → sui::AgentRunCertificate</div>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />

      <section className="wall-section border-y border-border bg-[#080f11]">
        <div className="wall-container">
          <div className="mb-12 max-w-4xl">
            <p className="wall-kicker">Integrated platform</p>
            <h2 className="wall-h2 mt-4">Recorder, storage, certificate, verifier. <span className="muted">One chain of custody.</span></h2>
          </div>
          <div className="grid gap-px border border-[#292f31] bg-[#292f31] md:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((card) => (
              <article key={card.title} className="bg-[#101618] p-6">
                <div className="mb-12 flex items-center justify-between">
                  <card.icon className="text-[#00d497]" size={22} />
                  <span className="wall-mono text-[10px] uppercase tracking-[.12em] text-[#4d5558]">Wallbox</span>
                </div>
                <h3 className="text-xl font-normal tracking-[-.02em] text-[#e7eaeb]">{card.title}</h3>
                <p className="mt-4 text-sm leading-6 text-[#7e8385]">{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="use-cases" className="wall-section border-b border-border bg-[#0a1113]">
        <div className="wall-container grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <p className="wall-kicker">Purpose built for frontier workloads</p>
            <h2 className="wall-h2 mt-4">Audit trails for agents that touch real work.</h2>
          </div>
          <div className="grid gap-px border border-[#292f31] bg-[#292f31] sm:grid-cols-2">
            {useCases.map((item) => (
              <div key={item} className="group flex items-center justify-between bg-[#101618] p-5 text-[#b8bdbf] transition hover:bg-[#151b1e] hover:text-[#e7eaeb]">
                <span>{item}</span>
                <span className="text-[#00d497] transition group-hover:translate-x-1">→</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="docs" className="wall-section bg-[#080f11]">
        <div className="wall-container">
          <div className="wall-panel grid gap-8 p-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div>
              <p className="wall-kicker">Submit ready</p>
              <h2 className="wall-h2 mt-4">Production demo on testnet. <span className="muted">Mainnet later.</span></h2>
              <p className="wall-copy mt-6">Current deployment uses real Walrus testnet blobs and real Sui testnet certificates. Mainnet stays locked until funding, monitoring, and ops ownership are ready.</p>
            </div>
            <div>
              <div className="wall-led-bars mb-6" aria-hidden="true">
                {Array.from({ length: 18 }).map((_, i) => <span key={i} style={{ height: `${10 + ((i * 23) % 70)}px` }} />)}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link href="/status" className="wall-button">Check status</Link>
                <Link href="/run" className="wall-button wall-button-primary">Run live test</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
