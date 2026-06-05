"use client";

import { useState } from "react";

export function CopyCode({ label, code, maxHeight = 560 }: { label: string; code: string; maxHeight?: number }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="mt-6 border border-[#292f31] bg-[#0d1316]">
      <div className="flex items-center justify-between gap-3 border-b border-[#292f31] px-4 py-3">
        <span className="wall-mono text-[10px] uppercase tracking-[.14em] text-[#7e8385]">{label}</span>
        <button type="button" onClick={copy} className="wall-button min-h-0 px-3 py-2 text-[10px]">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="wall-code overflow-auto p-4 text-xs leading-5 text-[#b8bdbf]" style={{ maxHeight }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
