import Link from "next/link";
import { Header } from "@/components/landing/header";
import { integrationStatus } from "@/lib/config/status";

export default function StatusPage() {
  const status = integrationStatus();
  const fullLive = status.blob.mode === "walrus" && status.certificate.mode === "sui-tatum" && status.blob.ready && status.certificate.ready;

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">Integration readiness</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-.03em]">Wallbox status</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Check whether the current deployment is running local fallback mode or live Walrus + Sui/Tatum mode.
            </p>
          </div>
          <Link className="rounded-md bg-primary px-4 py-2 text-center font-semibold text-primary-foreground" href="/run">
            Run demo
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <StatusCard
            title="Evidence storage"
            mode={status.blob.mode === "walrus" ? "Walrus live" : "Local fallback"}
            network={status.blob.network}
            ready={status.blob.ready}
            missing={status.blob.missing}
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

        <section className="mt-5 rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="font-semibold">Submission readiness</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {fullLive
                  ? "Full live mode is configured. Demo can show real Walrus and Sui/Tatum references."
                  : "Current deployment is demo-safe but not full live mode yet. Add keys/API later and switch env modes."}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${fullLive ? "bg-green-50 text-green-700" : "bg-[#fff7ed] text-[#8a4b0f]"}`}>
              {fullLive ? "Full live" : "Fallback active"}
            </span>
          </div>
          {!!status.warnings.length && (
            <div className="mt-5 grid gap-2">
              {status.warnings.map((warning) => (
                <p key={warning} className="rounded-xl border border-[#faae40]/30 bg-[#fff7ed] p-3 text-sm text-[#6b3d0c]">
                  {warning}
                </p>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatusCard({
  title,
  mode,
  network,
  ready,
  missing,
  extraRows = [],
}: {
  title: string;
  mode: string;
  network: string;
  ready: boolean;
  missing: string[];
  extraRows?: [string, string][];
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">{title}</p>
          <h2 className="mt-2 text-2xl font-semibold">{mode}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ready ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {ready ? "Ready" : "Missing config"}
        </span>
      </div>
      <div className="mt-5 space-y-3 text-sm">
        <Row label="Network" value={network} />
        <Row label="Missing" value={missing.length ? missing.join(", ") : "none"} />
        {extraRows.map(([label, value]) => (
          <Row key={label} label={label} value={value} />
        ))}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[.16em] text-primary">{label}</p>
      <p className="mt-1 break-all font-mono text-muted-foreground">{value}</p>
    </div>
  );
}
