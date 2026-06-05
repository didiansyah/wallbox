import { Archive, Bot, Fingerprint, ShieldCheck } from "lucide-react";

const steps = [
  ["01", "Record", Bot, "Capture prompts, tool calls, sources, artifacts, and outputs into a deterministic trace."],
  ["02", "Store", Archive, "Package evidence into one canonical JSON capsule and publish it to Walrus testnet."],
  ["03", "Certify", Fingerprint, "Anchor the capsule hash and Walrus blob ID in a Sui testnet certificate via Tatum RPC."],
  ["04", "Verify", ShieldCheck, "Fetch the capsule later, recompute hashes, and prove whether evidence integrity still holds."],
] as const;

export function HowItWorks() {
  return (
    <section id="product" className="wall-section border-t border-border bg-[#0a1113]">
      <div className="wall-container">
        <div className="mb-12 grid gap-6 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
          <div>
            <p className="wall-kicker">Product pipeline</p>
            <h2 className="wall-h2 mt-4">From agent run <span className="muted">to verifiable evidence.</span></h2>
          </div>
          <p className="wall-copy lg:justify-self-end">
            Wallbox turns agent execution into a chain of custody: trace, capsule, blob, certificate, verifier. Every screen should feel like infrastructure, not a generic audit log.
          </p>
        </div>

        <div className="grid gap-px border border-[#292f31] bg-[#292f31] md:grid-cols-4">
          {steps.map(([num, title, Icon, body]) => (
            <div key={title} className="group bg-[#101618] p-6 transition hover:bg-[#151b1e]">
              <div className="mb-10 flex items-center justify-between">
                <span className="wall-fig">FIG. {num}</span>
                <Icon className="text-[#00d497]" size={22} />
              </div>
              <h3 className="text-2xl font-normal tracking-[-.03em] text-[#e7eaeb]">{title}</h3>
              <p className="mt-4 text-sm leading-6 text-[#7e8385]">{body}</p>
              <div className="mt-8 h-1 w-full bg-[#1f2427]">
                <div className="h-full w-1/2 bg-[#00d497] opacity-60 transition-all group-hover:w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
