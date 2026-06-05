import Link from "next/link";
import { cookies } from "next/headers";
import { KeyRound, Lock, Settings, ShieldCheck } from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { integrationStatus } from "@/lib/config/status";
import { isWallboxAdminAuthorized, wallboxAdminConfigured } from "@/lib/config/admin-auth";
import { wallboxMaskedProjectKeys } from "@/lib/config/api-auth";
import { listRuns, type WallboxRun } from "@/lib/storage/local-store";

export const dynamic = "force-dynamic";

function fmt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
}

function short(value?: string, head = 10, tail = 6) {
  if (!value) return "—";
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export default async function AdminPage() {
  const token = (await cookies()).get("wallbox_admin")?.value;
  const authorized = isWallboxAdminAuthorized(token);

  if (!authorized) return <LockedAdmin configured={wallboxAdminConfigured()} />;

  const status = integrationStatus();
  const projects = wallboxMaskedProjectKeys();
  const runs = await listRuns(100);
  const runCounts = new Map<string, { projectName: string; total: number; verified: number; latest?: string }>();

  for (const run of runs) {
    const projectId = run.projectId || "legacy";
    const current = runCounts.get(projectId) || { projectName: run.projectName || "Legacy", total: 0, verified: 0, latest: undefined };
    current.total += 1;
    if (run.status === "VERIFIED") current.verified += 1;
    if (!current.latest || Date.parse(run.createdAt) > Date.parse(current.latest)) current.latest = run.createdAt;
    runCounts.set(projectId, current);
  }

  const projectRows = projects.map((project) => ({
    ...project,
    stats: runCounts.get(project.projectId) || { projectName: project.projectName, total: 0, verified: 0, latest: undefined },
  }));
  const orphanRows = Array.from(runCounts.entries())
    .filter(([projectId]) => !projects.some((project) => project.projectId === projectId))
    .map(([projectId, stats]) => ({ projectId, projectName: stats.projectName, source: "stored runs", maskedKey: "—", keyHash: "—", stats }));
  const rows = [...projectRows, ...orphanRows];

  const baseUrl = status.appUrl;
  const sdkSnippet = `import { WallboxClient } from "@wallbox/sdk";\n\nconst wallbox = new WallboxClient({\n  baseUrl: "${baseUrl}",\n  apiKey: process.env.WALLBOX_API_KEY!,\n});`;
  const mcpSnippet = `mcp_servers:\n  wallbox:\n    command: "node"\n    args: ["/root/wallbox/packages/mcp-server/dist/index.js"]\n    env:\n      WALLBOX_BASE_URL: "${baseUrl}"\n      WALLBOX_API_KEY: "wbx_project_key"`;
  const envSnippet = `WALLBOX_ADMIN_KEY=admin_secret\nWALLBOX_API_KEYS="agenthub=wbx_agenthub, meridian|Meridian Bot|wbx_meridian"`;

  return (
    <main className="wall-shell">
      <Header />
      <section className="wall-section wall-grid-bg">
        <div className="wall-container">
          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="wall-kicker">Admin console</p>
              <h1 className="mt-3 text-5xl font-normal tracking-[-.055em] text-[#e7eaeb] md:text-7xl">Wallbox control plane</h1>
              <p className="wall-copy mt-4">Read-only deployment status, masked project keys, run counts, and install snippets.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/runs" className="wall-button">Runs</Link>
              <Link href="/status" className="wall-button wall-button-primary">Live status</Link>
            </div>
          </div>

          <div className="mb-5 grid gap-px border border-[#292f31] bg-[#292f31] md:grid-cols-4">
            <Metric label="Projects" value={String(projects.length)} />
            <Metric label="Recent runs" value={String(runs.length)} />
            <Metric label="Capture auth" value={status.captureApi.authConfigured ? "Ready" : "Missing"} />
            <Metric label="Chain mode" value={status.certificate.mode} />
          </div>

          <section className="mb-5 grid gap-px border border-[#292f31] bg-[#292f31] lg:grid-cols-3">
            <StatusBlock title="Capture API" status={status.captureApi.authConfigured ? "Key protected" : "Missing key"} rows={[["Project count", String(status.captureApi.projectCount)], ["Auth", "x-wallbox-api-key / bearer"]]} />
            <StatusBlock title="Walrus" status={status.blob.ready ? `${status.blob.mode} / ${status.blob.network}` : "Missing config"} rows={[["Missing", status.blob.missing.join(", ") || "none"]]} />
            <StatusBlock title="Sui certificate" status={status.certificate.ready ? `${status.certificate.mode} / ${status.certificate.network}` : "Missing config"} rows={[["Tatum RPC", status.certificate.tatumRpcConfigured ? "configured" : "missing"], ["Signer", status.certificate.signerConfigured ? "configured" : "missing"], ["Package", status.certificate.packageConfigured ? "configured" : "missing"]]} />
          </section>

          <section className="wall-panel mb-5 p-6">
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-[#292f31] pb-4">
              <div>
                <p className="wall-kicker">Projects and keys</p>
                <h2 className="mt-3 text-3xl font-normal tracking-[-.04em] text-[#e7eaeb]">Masked key inventory</h2>
              </div>
              <KeyRound className="text-[#00d497]" size={24} />
            </div>
            <div className="grid gap-px border border-[#292f31] bg-[#292f31]">
              {rows.length ? rows.map((row) => <ProjectRow key={`${row.projectId}-${row.keyHash}`} row={row} />) : <EmptyRow text="No project keys configured yet." />}
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-3">
            <SnippetCard title="Project keys env" code={envSnippet} />
            <SnippetCard title="SDK install shape" code={sdkSnippet} />
            <SnippetCard title="Hermes MCP config" code={mcpSnippet} />
          </section>

          {!!status.warnings.length && (
            <section className="wall-panel mt-5 p-6">
              <p className="wall-kicker">Warnings</p>
              <div className="mt-4 grid gap-2">
                {status.warnings.map((warning) => <p key={warning} className="border border-[#febb55]/35 bg-[#2a2012] p-3 text-sm text-[#febb55]">{warning}</p>)}
              </div>
            </section>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function LockedAdmin({ configured }: { configured: boolean }) {
  return (
    <main className="wall-shell">
      <Header />
      <section className="wall-section wall-grid-bg">
        <div className="wall-container max-w-3xl">
          <section className="wall-panel p-8">
            <div className="mb-6 grid size-12 place-items-center border border-[#236a4c] bg-[#003931] text-[#00d497]"><Lock size={22} /></div>
            <p className="wall-kicker">Admin locked</p>
            <h1 className="mt-4 text-5xl font-normal tracking-[-.055em] text-[#e7eaeb]">Enter admin key.</h1>
            <p className="wall-copy mt-5">This page is read-only, but it can expose deployment metadata. Use `WALLBOX_ADMIN_KEY`; until provisioned, the server capture key can unlock it.</p>
            <form action="/api/admin/session" method="post" className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input name="key" type="password" placeholder={configured ? "WALLBOX_ADMIN_KEY" : "No key configured"} className="min-h-12 border border-[#292f31] bg-[#0d1316] px-4 font-mono text-sm text-[#e7eaeb] outline-none focus:border-[#00d497]" />
              <button className="wall-button wall-button-primary" type="submit"><ShieldCheck size={15} /> Unlock</button>
            </form>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0d1316] p-5">
      <p className="wall-mono text-[10px] uppercase tracking-[.14em] text-[#00d497]">{label}</p>
      <p className="mt-3 break-all text-3xl font-normal tracking-[-.04em] text-[#e7eaeb]">{value}</p>
    </div>
  );
}

function StatusBlock({ title, status, rows }: { title: string; status: string; rows: [string, string][] }) {
  return (
    <section className="bg-[#101618] p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="wall-kicker">{title}</p>
          <h2 className="mt-3 text-2xl font-normal tracking-[-.04em] text-[#e7eaeb]">{status}</h2>
        </div>
        <Settings className="text-[#00d497]" size={20} />
      </div>
      <div className="mt-5 grid gap-px border border-[#292f31] bg-[#292f31]">
        {rows.map(([label, value]) => <Row key={label} label={label} value={value} />)}
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

function ProjectRow({ row }: { row: { projectId: string; projectName: string; source: string; maskedKey: string; keyHash: string; stats: { total: number; verified: number; latest?: string } } }) {
  return (
    <article className="grid gap-4 bg-[#0d1316] p-5 lg:grid-cols-[.8fr_.8fr_.7fr_.6fr_.7fr] lg:items-center">
      <div>
        <p className="text-sm text-[#e7eaeb]">{row.projectName}</p>
        <p className="mt-2 font-mono text-[11px] text-[#7e8385]">{row.projectId}</p>
      </div>
      <div>
        <p className="wall-mono text-xs text-[#e7eaeb]">{row.maskedKey}</p>
        <p className="mt-2 font-mono text-[11px] text-[#7e8385]">hash {short(row.keyHash, 8, 4)}</p>
      </div>
      <p className="font-mono text-xs text-[#b8bdbf]">{row.source}</p>
      <p className="font-mono text-xs text-[#b8bdbf]">{row.stats.verified}/{row.stats.total} verified</p>
      <p className="font-mono text-xs text-[#b8bdbf]">{row.stats.latest ? fmt(row.stats.latest) : "—"}</p>
    </article>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <div className="bg-[#0d1316] p-5 text-sm text-[#7e8385]">{text}</div>;
}

function SnippetCard({ title, code }: { title: string; code: string }) {
  return (
    <section className="wall-panel p-5">
      <p className="wall-kicker">{title}</p>
      <pre className="mt-4 max-h-72 overflow-auto border border-[#292f31] bg-[#080f11] p-4 text-[11px] leading-5 text-[#b8bdbf]"><code>{code}</code></pre>
    </section>
  );
}
