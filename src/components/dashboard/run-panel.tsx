"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Archive,
  Bot,
  Database,
  Fingerprint,
  Loader2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

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
  ["Generating trace", Bot],
  ["Building capsule", Archive],
  ["Storing evidence", Database],
  ["Anchoring certificate", Fingerprint],
  ["Verification ready", ShieldCheck],
] as const;

function modeLabel(run: RunResponse) {
  const blob = run.blob_mode === "walrus" ? "Walrus live" : "Walrus local fallback";
  const certificate = run.certificate_mode === "sui-tatum" ? "Sui/Tatum live" : "Sui local fallback";
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
    if (!res.ok) {
      setError(json.error || "Run failed");
      return;
    }
    setRun(json);
  }

  async function tamper() {
    if (!run) return;
    setTampering(true);
    setError("");

    const res = await fetch(`/api/demo/tamper/${run.run_id}`, { method: "POST" });
    const json = (await res.json()) as TamperResponse;
    setTampering(false);

    if (!res.ok) {
      setError(json.error || "Tamper demo failed");
      return;
    }
    window.location.href = json.verify_url;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">Demo agent</p>
          <h1 className="mt-2 text-3xl font-semibold">RiskLens trust review run</h1>
          <p className="mt-2 text-muted-foreground">
            Deterministic flow: trace, capsule, evidence storage, certificate anchor, verification.
          </p>
        </div>
        <button
          onClick={start}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-60"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Bot size={18} />}
          Start run
        </button>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-5">
        {steps.map(([label, Icon], i) => (
          <div
            key={label}
            className={`rounded-xl border p-4 ${run || loading ? "border-primary/40 bg-primary/5" : "border-border bg-secondary"}`}
          >
            <Icon className={run || loading ? "text-primary" : "text-muted-foreground"} size={20} />
            <p className="mt-3 text-sm font-medium">{label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{run ? "complete" : loading && i < 4 ? "processing" : "waiting"}</p>
          </div>
        ))}
      </div>

      {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      {run && (
        <div className="mt-8 rounded-2xl border border-border bg-[#111111] p-5 text-[#fff7ed]">
          <div className="mb-5 flex flex-col justify-between gap-3 border-b border-white/10 pb-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[.18em] text-[#faae40]">Mode</p>
              <p className="mt-1 text-sm text-white/75">{modeLabel(run)}</p>
            </div>
            {(run.blob_mode === "local" || run.certificate_mode === "local") && (
              <span className="rounded-full border border-[#faae40]/40 bg-[#faae40]/10 px-3 py-1 text-xs font-semibold text-[#faae40]">
                Local demo mode
              </span>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field k="Run ID" v={run.run_id} />
            <Field k="Capsule hash" v={run.capsule_hash} />
            <Field k="Evidence blob" v={run.walrus_blob_id} />
            <Field k="Certificate ID" v={run.sui_certificate_id} />
            <Field k="Transaction digest" v={run.sui_tx_digest} />
            <Field k="Verification URL" v={run.verify_url} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground" href={run.verify_url}>
              Open verifier
            </Link>
            <Link className="rounded-md border border-white/20 px-4 py-2 font-semibold text-white" href={run.capsule_url}>
              Inspect capsule
            </Link>
            <button
              onClick={tamper}
              disabled={tampering}
              className="inline-flex items-center gap-2 rounded-md border border-red-300/40 bg-red-500/10 px-4 py-2 font-semibold text-red-200 disabled:opacity-60"
            >
              {tampering ? <Loader2 className="animate-spin" size={16} /> : <ShieldAlert size={16} />}
              Simulate tampering
            </button>
          </div>

          <p className="mt-4 text-xs leading-5 text-white/55">
            Tamper demo modifies only the local cached evidence clone, then verifies it against the original certificate hash. Immutable Walrus blobs are not mutated.
          </p>
        </div>
      )}
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[.16em] text-[#faae40]">{k}</p>
      <code className="break-all text-sm text-white/80">{v}</code>
    </div>
  );
}
