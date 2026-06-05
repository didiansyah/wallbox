import Link from "next/link";
import { Box, ShieldCheck } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[#080f11]/90 backdrop-blur-xl">
      <div className="wall-container flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative grid size-8 place-items-center border border-[#236a4c] bg-[#003931] text-[#00d497]">
            <Box size={17} />
            <span className="absolute -right-1 -top-1 size-2 bg-[#00d497] shadow-[0_0_16px_#00d497]" />
          </span>
          <span className="wall-nav text-sm font-medium uppercase tracking-[.14em] text-[#e7eaeb]">Wallbox</span>
        </Link>

        <nav className="wall-nav hidden items-center gap-7 text-[12px] uppercase tracking-[.12em] text-[#9aa2a5] lg:flex">
          <a className="transition hover:text-[#e7eaeb]" href="/#product">Product</a>
          <a className="transition hover:text-[#e7eaeb]" href="/#security">Security</a>
          <Link className="transition hover:text-[#e7eaeb]" href="/status">Status</Link>
          <a className="transition hover:text-[#e7eaeb]" href="/#docs">Docs</a>
          <a className="transition hover:text-[#e7eaeb]" href="/#use-cases">Use cases</a>
        </nav>

        <div className="flex gap-2">
          <Link className="wall-button hidden sm:inline-flex" href="/verify/local-demo">Verify</Link>
          <Link className="wall-button wall-button-primary" href="/run">
            <ShieldCheck size={15} /> Run demo
          </Link>
        </div>
      </div>
    </header>
  );
}
