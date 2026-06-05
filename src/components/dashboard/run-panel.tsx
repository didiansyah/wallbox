"use client";

import Link from "next/link";
import { useState } from "react";
import { Archive, Bot, Database, Fingerprint, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";

type RunResponse = {
  run_id: string;
  status: string;
  capsule_hash: string;
  walrus_blob_id: string;
  sui_certificate_id: string;
  sui_tx_digest: string;
  verify_url: string;
  capsule_url: string;
  blob_mode: "walrus" | "local";
  certificate_mode: "sui-tatum" | "local";
  error?: string;
};

type TamperResponse = { run_id: string; tampered: boolean; verify_url: string; error?: string };

const steps = [
  ["01", "Generating trace", Bot],
  ["02", "Building capsule", Archive],
  ["03", "Storing evidence", Database],
  ["04", "Anchoring certificate", Fingerprint],
  ["05", "Verification ready", ShieldCheck],
] as const;

function modeLabel(run: RunResponse) {
  const blob = run.blob_mode === "walrus" ? "Walrus testnet" : "Local blob fallback";
  const certificate = run.certificate_mode === "sui-tatum" ? "Sui/Tatum testnet" : "Local certificate fallback";
  return `${blob} · ${certificate}`;
}

export function RunPanel() {
  const [run, setRun] = useState<RunResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [tampering, setTampering] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setLoading(true);
    setError("");
    setRun(null);
    const res = await fetch("/api/runs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ task_type: "ai_agent_trust_demo" }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) return setError(json.error || "Run failed");
    setRun(json);
  }

  async function tamper() {
    if (!run) return;
    setTampering(true);
    setError("");
    const res = await fetch(`/api/demo/tamper/${run.run_id}`, { method: "POST" });
    const json = (await res.json()) as TamperResponse;
    setTampering(false);
    if (!res.ok) return setError(json.error || "Tamper demo failed");
    window.location.href = json.verify_url;
  }

  return (
    <div className="wall-panel p-6">
      <div className="flex flex-col justify-between gap-5 border-b border-[#292f31] pb-6 md:flex-row md:items-start">
        <div>
          <p className="wall-kicker">Execution console</p>
          <h1 className="mt-3 text-4xl font-normal tracking-[-.045em] text-[#e7eaeb] md:text-6xl">RiskLens trust review run</h1>
          <p className="wall-copy mt-4">Deterministic flow: trace, capsule, evidence storage, certificate anchor, verification.</p>
        </div>
        <button onClick={start} disabled={loading} className="wall-button wall-button-primary shrink-0 disabled:opacity-60">
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Bot size={16} />}
          Start run
        </button>
      </div>

      <div className="mt-6 grid gap-px border border-[#292f31] bg-[#292f31] md:grid-cols-5">
        {steps.map(([num, label, Icon], i) => (
          <div key={label} className={`bg-[#0d1316] p-4 ${run || loading ? "text-[#e7eaeb]" : "text-[#7e8385]"}`}>
            <div className="mb-8 flex items-center justify-between">
              <span className="wall-fig">{num}</span>
              <Icon className={run || loading ? "text-[#00d497]" : "text-[#4d5558]"} size={19} />
            </div>
            <p className="text-sm">{label}</p>
            <p className="wall-mono mt-2 text-[10px] uppercase tracking-[.12em] text-[#7e8385]">{run ? "complete" : loading && i < 4 ? "processing" : "waiting"}</p>
          </div>
        ))}
      </div>

      {error && <div className="mt-6 border border-[#ff6785]/40 bg-[#2a1118] p-4 text-sm text-[#ff9daf]">{error}</div>}

      {run && (
        <div className="mt-6 border border-[#292f31] bg-[#080f11] p-5">
          <div className="mb-5 flex flex-col justify-between gap-3 border-b border-[#292f31] pb-4 md:flex-row md:items-center">
            <div>
              <p className="wall-kicker">Mode</p>
              <p className="mt-2 text-sm text-[#b8bdbf]">{modeLabel(run)}</p>
            </div>
            {(run.blob_mode === "local" || run.certificate_mode === "local") ? <span className="wall-fig text-[#febb55]">Local fallback</span> : <span className="wall-status">Live testnet</span>}
          </div>

          <div className="grid gap-px border border-[#292f31] bg-[#292f31] md:grid-cols-2">
            <Field k="Run ID" v={run.run_id} />
            <Field k="Capsule hash" v={run.capsule_hash} />
            <Field k="Evidence blob" v={run.walrus_blob_id} />
            <Field k="Certificate ID" v={run.sui_certificate_id} />
            <Field k="Transaction digest" v={run.sui_tx_digest} />
            <Field k="Verification URL" v={run.verify_url} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="wall-button wall-button-primary" href={run.verify_url}>Open verifier</Link>
            <Link className="wall-button" href={run.capsule_url}>Inspect capsule</Link>
            <button onClick={tamper} disabled={tampering} className="wall-button border-[#ff6785]/45 bg-[#2a1118] text-[#ff9daf] disabled:opacity-60">
              {tampering ? <Loader2 className="animate-spin" size={16} /> : <ShieldAlert size={16} />}
              Simulate tampering
            </button>
          </div>

          <p className="mt-4 text-xs leading-5 text-[#7e8385]">
            Tamper demo modifies only the local cached evidence clone, then verifies it against the original certificate hash. Immutable Walrus blobs are not mutated.
          </p>
        </div>
      )}
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-[#0d1316] p-4">
      <p className="wall-mono text-[10px] uppercase tracking-[.14em] text-[#00d497]">{k}</p>
      <code className="mt-2 block break-all text-xs leading-5 text-[#b8bdbf]">{v}</code>
    </div>
  );
}
