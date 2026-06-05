import Link from "next/link";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { CopyCode } from "@/components/integrations/copy-code";

const tsSdkSnippet = `import { WallboxClient } from "@wallbox/sdk";

const wallbox = new WallboxClient({
  baseUrl: "https://wallbox.hanslabs.xyz",
  apiKey: process.env.WALLBOX_API_KEY!,
});

const result = await wallbox.captureRun({
  task: "Review this agent decision for auditability",
  agent: { id: "research-agent-prod", name: "Research Agent", version: "1.4.2" },
  model: { provider: "anthropic", name: "claude-sonnet", version: "2026-06" },
  trace: [{
    id: "step_001",
    type: "tool_call",
    name: "search_web",
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    inputHash: "sha256:task-input",
    outputHash: "sha256:tool-output",
    summary: "Fetched sources used by the agent."
  }],
  sources: [{
    id: "src_001",
    type: "url",
    label: "Primary source",
    uri: "https://example.com/source",
    accessedAt: new Date().toISOString()
  }],
  artifacts: { "final_report.md": "# Agent output\\nEvidence captured by Wallbox." }
});

console.log(result.verify_url, result.sui_certificate_id);`;

const apiSnippet = `await fetch("https://wallbox.hanslabs.xyz/api/runs", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-wallbox-api-key": process.env.WALLBOX_API_KEY
  },
  body: JSON.stringify({
    mode: "external",
    task: "Review this agent decision for auditability",
    agent: { id: "research-agent-prod", name: "Research Agent", version: "1.4.2" },
    model: { provider: "anthropic", name: "claude-sonnet", version: "2026-06" },
    trace: [{
      id: "step_001",
      type: "tool_call",
      name: "search_web",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      inputHash: "sha256:task-input",
      outputHash: "sha256:tool-output",
      summary: "Fetched sources used by the agent."
    }],
    sources: [{
      id: "src_001",
      type: "url",
      label: "Primary source",
      uri: "https://example.com/source",
      accessedAt: new Date().toISOString()
    }],
    artifacts: { "final_report.md": "# Agent output\\nEvidence captured by Wallbox." }
  })
});`;

const pythonSnippet = `import os
import requests
from datetime import datetime, timezone

now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

response = requests.post(
    "https://wallbox.hanslabs.xyz/api/runs",
    headers={
        "content-type": "application/json",
        "x-wallbox-api-key": os.environ["WALLBOX_API_KEY"],
    },
    json={
        "mode": "external",
        "task": "Review this agent decision for auditability",
        "agent": {"id": "python-agent-prod", "name": "Python Agent", "version": "1.0.0"},
        "trace": [{
            "id": "step_001",
            "type": "decision",
            "name": "final_answer",
            "startedAt": now,
            "completedAt": now,
            "summary": "Captured final agent decision and supporting evidence."
        }],
        "artifacts": {"final_report.md": "# Agent output\\nEvidence captured by Wallbox."},
    },
    timeout=60,
)
response.raise_for_status()
print(response.json()["verify_url"])`;

const mcpSnippet = `# Hermes / MCP stdio server
WALLBOX_BASE_URL=https://wallbox.hanslabs.xyz
WALLBOX_API_KEY=wbx_project_key

wallbox_capture_run({ task, agent, trace, sources, artifacts })
wallbox_list_runs({ limit: 25 })
wallbox_get_run({ run_id })
wallbox_verify_certificate({ certificate_id })
wallbox_status({})`;

const modes = [
  {
    label: "01",
    title: "API / SDK",
    body: "Default path for existing agents. LangChain, CrewAI, AutoGen, Python, TypeScript, or internal systems post trace and artifacts to Wallbox.",
  },
  {
    label: "02",
    title: "MCP connector",
    body: "Optional for MCP-native agents. Wallbox is available as a stdio tool server for capture, list, get, status, and verify calls.",
  },
  {
    label: "03",
    title: "Hosted runner",
    body: "Wallbox can run demo or template agents when the user does not want to instrument their own runtime yet.",
  },
];

const responseFields = [
  ["run_id", "Stable run handle inside Wallbox storage."],
  ["capsule_hash", "Canonical hash committed to the certificate."],
  ["walrus_blob_id", "Evidence capsule blob location."],
  ["sui_certificate_id", "Sui object ID used by public verification."],
  ["sui_tx_digest", "Transaction digest for chain explorer lookup."],
  ["project_id", "Project attached to the API key that submitted the run."],
  ["verify_url", "Public verifier route for the submitted evidence."],
];

export default function IntegrationsPage() {
  return (
    <main className="wall-shell">
      <Header />
      <section className="wall-section wall-grid-bg border-b border-border">
        <div className="wall-container">
          <Link href="/" className="wall-button mb-8">← Back to landing</Link>
          <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
            <div>
              <p className="wall-kicker">Bring your own agent</p>
              <h1 className="mt-4 text-5xl font-normal leading-none tracking-[-.055em] text-[#e7eaeb] md:text-7xl">
                Wallbox is the audit layer. <span className="muted">Not just a demo runner.</span>
              </h1>
              <p className="wall-copy mt-7">
                The demo agent proves the chain-of-custody path. Production agents can keep their own runtime and submit traces, sources, outputs, and artifact hashes through the Wallbox capture API.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#sdk" className="wall-button wall-button-primary">Copy SDK shape</Link>
                <Link href="/status" className="wall-button">Check live status</Link>
              </div>
            </div>

            <div className="wall-panel p-5">
              <div className="mb-4 flex items-center justify-between border-b border-[#292f31] pb-4">
                <span className="wall-fig">FIG. 02 Integration map</span>
                <span className="wall-status">API first</span>
              </div>
              <div className="grid gap-px border border-[#292f31] bg-[#292f31]">
                {modes.map((mode) => (
                  <article key={mode.title} className="bg-[#0d1316] p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="wall-fig">{mode.label}</span>
                      <span className="mx-4 h-px flex-1 bg-[#292f31]" />
                      <span className="wall-mono text-[10px] uppercase tracking-[.12em] text-[#00d497]">supported path</span>
                    </div>
                    <h2 className="text-2xl font-normal tracking-[-.03em] text-[#e7eaeb]">{mode.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-[#7e8385]">{mode.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="sdk" className="wall-section border-b border-border bg-[#080f11]">
        <div className="wall-container">
          <div className="mb-8 grid gap-5 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <p className="wall-kicker">Capture API</p>
              <h2 className="wall-h2 mt-4">Submit external runs.</h2>
            </div>
            <p className="wall-copy lg:justify-self-end">
              Every integration sends the same evidence object: task, agent identity, trace entries, sources, and artifacts. Wallbox returns Walrus and Sui handles for verification.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="wall-panel p-6">
              <p className="wall-kicker">TypeScript shape</p>
              <h3 className="mt-4 text-3xl font-normal tracking-[-.04em] text-[#e7eaeb]">SDK-ready capture.</h3>
              <p className="mt-4 text-sm leading-6 text-[#7e8385]">This is the public package shape to ship later. Today it maps directly to the HTTP endpoint.</p>
              <CopyCode label="typescript sdk" code={tsSdkSnippet} />
            </div>

            <div className="wall-panel p-6">
              <p className="wall-kicker">Direct HTTP</p>
              <h3 className="mt-4 text-3xl font-normal tracking-[-.04em] text-[#e7eaeb]">No runtime dependency.</h3>
              <p className="mt-4 text-sm leading-6 text-[#7e8385]">Use this from any backend. Keep the API key server-side; project keys automatically label and scope submitted runs.</p>
              <CopyCode label="fetch post" code={apiSnippet} />
            </div>

            <div className="wall-panel p-6">
              <p className="wall-kicker">Python agent</p>
              <h3 className="mt-4 text-3xl font-normal tracking-[-.04em] text-[#e7eaeb]">LangChain, CrewAI, custom runners.</h3>
              <p className="mt-4 text-sm leading-6 text-[#7e8385]">Python agents can submit the final trace after a run, or stream events later through the MCP wrapper.</p>
              <CopyCode label="python requests" code={pythonSnippet} />
            </div>

            <div className="wall-panel p-6">
              <p className="wall-kicker">Response contract</p>
              <h3 className="mt-4 text-3xl font-normal tracking-[-.04em] text-[#e7eaeb]">What the customer stores.</h3>
              <div className="mt-6 grid gap-px border border-[#292f31] bg-[#292f31]">
                {responseFields.map(([key, value]) => (
                  <div key={key} className="bg-[#0d1316] p-4">
                    <p className="wall-mono text-[10px] uppercase tracking-[.12em] text-[#00d497]">{key}</p>
                    <p className="mt-2 text-sm leading-6 text-[#7e8385]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="wall-section border-b border-border bg-[#080f11]">
        <div className="wall-container grid gap-8 lg:grid-cols-2">
          <div className="wall-panel p-6">
            <p className="wall-kicker">MCP roadmap</p>
            <h2 className="wall-h2 mt-4">Connector, not a dependency.</h2>
            <p className="wall-copy mt-5">MCP is useful when the user already runs an MCP-capable agent. Wallbox now exposes a stdio server that wraps the same capture, list, get, status, and verify API.</p>
            <CopyCode label="mcp tools" code={mcpSnippet} maxHeight={360} />
          </div>

          <div className="wall-panel p-6">
            <p className="wall-kicker">Signer modes</p>
            <h2 className="wall-h2 mt-4">Private keys stay server-side.</h2>
            <p className="wall-copy mt-5">The customer submits evidence. Wallbox signs the Sui certificate on the backend unless the customer opts into wallet or enterprise signer mode.</p>
            <div className="mt-6 grid gap-px border border-[#292f31] bg-[#292f31]">
              {[
                ["Custodial signer", "Default SaaS mode. Wallbox signs Sui certificates server-side."],
                ["User wallet", "Advanced Web3 mode. User signs and pays gas with their own Sui wallet."],
                ["Enterprise signer", "Dedicated project wallet for teams that need separate ownership boundaries."],
              ].map(([k, v]) => (
                <div key={k} className="bg-[#0d1316] p-4">
                  <p className="wall-mono text-[10px] uppercase tracking-[.12em] text-[#00d497]">{k}</p>
                  <p className="mt-2 text-sm leading-6 text-[#7e8385]">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
