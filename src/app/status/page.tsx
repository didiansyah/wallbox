import Link from "next/link";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { integrationStatus } from "@/lib/config/status";

export default function StatusPage() {
  const status = integrationStatus();
  const fullLive = status.blob.mode === "walrus" && status.certificate.mode === "sui-tatum" && status.blob.ready && status.certificate.ready;

  return (
    <main className="wall-shell">
      <Header />
      <section className="wall-section wall-grid-bg">
        <div className="wall-container">
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="wall-kicker">Integration readiness</p>
              <h1 className="mt-3 text-5xl font-normal tracking-[-.055em] text-[#e7eaeb] md:text-7xl">Wallbox status</h1>
              <p className="wall-copy mt-4">Current storage and certificate mode for this deployment.</p>
            </div>
            <Link className="wall-button wall-button-primary" href="/run">Run demo</Link>
          </div>

          <div className="grid gap-px border border-[#292f31] bg-[#292f31] lg:grid-cols-3">
            <StatusCard title="Evidence storage" mode={status.blob.mode === "walrus" ? "Walrus live" : "Local fallback"} network={status.blob.network} ready={status.blob.ready} missing={status.blob.missing} />
            <StatusCard
              title="Capture API"
              mode={status.captureApi.authConfigured ? "Key protected" : "Dev open"}
              network="HTTP"
              ready={status.captureApi.authConfigured}
              missing={status.captureApi.authConfigured ? [] : ["WALLBOX_API_KEY"]}
              extraRows={[["Auth", status.captureApi.authConfigured ? "x-wallbox-api-key / bearer" : "required before public exposure"]]}
            />
            <StatusCard
              title="Certificate anchor"
              mode={status.certificate.mode === "sui-tatum" ? "Sui/Tatum live" : "Local fallback"}
              network={status.certificate.network}
              ready={status.certificate.ready}
              missing={status.certificate.missing}
              extraRows={[
                ["Tatum RPC", status.certificate.tatumRpcConfigured ? "configured" : "missing"],
                ["Sui signer", status.certificate.signerConfigured ? "configured" : "missing"],
                ["Move package", status.certificate.packageConfigured ? "configured" : "not deployed/configured"],
              ]}
            />
          </div>

          <section className="wall-panel mt-5 p-6">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="wall-kicker">Submission readiness</h2>
                <p className="mt-3 text-sm text-[#b8bdbf]">
                  {fullLive ? "Live testnet storage and certificate anchoring are configured." : "Fallback mode is active. Live storage or certificate configuration is missing."}
                </p>
              </div>
              <span className={fullLive ? "wall-status" : "wall-fig text-[#febb55]"}>{fullLive ? "Full live testnet" : "Fallback active"}</span>
            </div>
            {!!status.warnings.length && (
              <div className="mt-5 grid gap-2">
                {status.warnings.map((warning: string) => <p key={warning} className="border border-[#febb55]/35 bg-[#2a2012] p-3 text-sm text-[#febb55]">{warning}</p>)}
              </div>
            )}
          </section>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function StatusCard({ title, mode, network, ready, missing, extraRows = [] }: { title: string; mode: string; network: string; ready: boolean; missing: string[]; extraRows?: [string, string][] }) {
  return (
    <section className="bg-[#101618] p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="wall-kicker">{title}</p>
          <h2 className="mt-3 text-3xl font-normal tracking-[-.04em] text-[#e7eaeb]">{mode}</h2>
        </div>
        <span className={ready ? "wall-status" : "wall-fig text-[#ff6785]"}>{ready ? "Ready" : "Missing config"}</span>
      </div>
      <div className="mt-6 grid gap-px border border-[#292f31] bg-[#292f31] text-sm">
        <Row label="Network" value={network} />
        <Row label="Missing" value={missing.length ? missing.join(", ") : "none"} />
        {extraRows.map(([label, value]) => <Row key={label} label={label} value={value} />)}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0d1316] p-4">
      <p className="wall-mono text-[10px] uppercase tracking-[.14em] text-[#00d497]">{label}</p>
      <p className="mt-2 break-all font-mono text-xs text-[#b8bdbf]">{value}</p>
    </div>
  );
}
