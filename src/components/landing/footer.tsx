import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#080f11]">
      <div className="wall-container grid gap-8 py-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="wall-nav text-sm font-medium uppercase tracking-[.14em] text-[#e7eaeb]">Wallbox</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#7e8385]">
            Audit capsules for AI agent runs. Testnet certificates are live; mainnet stays off until signer ops and monitoring are ready.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <Link href="/run" className="wall-button wall-button-primary">Run demo</Link>
          <Link href="/integrations" className="wall-button">Integrations</Link>
          <Link href="/status" className="wall-button">Status</Link>
          <Link href="/verify/local-demo" className="wall-button">Verify</Link>
        </div>
      </div>
      <div className="border-t border-[#292f31] py-4">
        <div className="wall-container flex flex-col gap-2 text-[10px] uppercase tracking-[.14em] text-[#4d5558] wall-mono sm:flex-row sm:items-center sm:justify-between">
          <span>Walrus testnet / Sui testnet</span>
          <span>Integrity verified, not truth certified</span>
        </div>
      </div>
    </footer>
  );
}
