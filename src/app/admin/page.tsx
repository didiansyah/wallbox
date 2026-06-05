import Link from "next/link";
import { cookies } from "next/headers";
import { Copy, KeyRound, Lock, Plus, RotateCw, Settings, ShieldCheck, Trash2 } from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { integrationStatus } from "@/lib/config/status";
import { isWallboxAdminAuthorized, wallboxAdminConfigured } from "@/lib/config/admin-auth";
import { listProjectSummaries } from "@/lib/storage/project-store";
import { listRuns } from "@/lib/storage/local-store";

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

export default async function AdminPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const token = (await cookies()).get("wallbox_admin")?.value;
  const authorized = isWallboxAdminAuthorized(token);

  if (!authorized) return <LockedAdmin configured={wallboxAdminConfigured()} />;

  const status = integrationStatus();
  const params = (await searchParams) || {};
  const newKey = typeof params.new_key === "string" ? params.new_key : "";
  const newKeyProject = typeof params.project_id === "string" ? params.project_id : "";
  const ok = typeof params.ok === "string" ? params.ok : "";
  const error = typeof params.error === "string" ? params.error : "";
  const projects = listProjectSummaries();
  const runs = await listRuns(100);
  const activeProjects = new Set(projects.filter((project) => project.active).map((project) => project.projectId));
  const uniqueProjects = Array.from(new Map(projects.map((project) => [project.projectId, project])).values());

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
              <p className="wall-copy mt-4">Deployment status, project-scoped keys, run counts, and install snippets.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/runs" className="wall-button">Runs</Link>
              <Link href="/status" className="wall-button wall-button-primary">Live status</Link>
            </div>
          </div>

          <div className="mb-5 grid gap-px border border-[#292f31] bg-[#292f31] md:grid-cols-4">
            <Metric label="Projects" value={String(activeProjects.size)} />
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
                <h2 className="mt-3 text-3xl font-normal tracking-[-.04em] text-[#e7eaeb]">Generate, rotate, revoke</h2>
              </div>
              <KeyRound className="text-[#00d497]" size={24} />
            </div>
            {(newKey || ok || error) && (
              <div className="mb-5 grid gap-3">
                {newKey && <RevealKey projectId={newKeyProject} apiKey={newKey} />}
                {ok && <p className="border border-[#236a4c] bg-[#003931] p-3 text-sm text-[#00d497]">Saved: {ok}</p>}
                {error && <p className="border border-[#febb55]/35 bg-[#2a2012] p-3 text-sm text-[#febb55]">Error: {error}</p>}
              </div>
            )}
            <div className="mb-5 grid gap-4 lg:grid-cols-2">
              <CreateProjectForm />
              <CreateKeyForm projects={uniqueProjects.map((project) => ({ projectId: project.projectId, projectName: project.projectName }))} />
            </div>
            <div className="grid gap-px border border-[#292f31] bg-[#292f31]">
              {projects.length ? projects.map((row) => <ProjectRow key={`${row.projectId}-${row.keyHash}-${row.keyId || row.source}`} row={row} />) : <EmptyRow text="No project keys configured yet." />}
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

function RevealKey({ projectId, apiKey }: { projectId: string; apiKey: string }) {
  return (
    <section className="border border-[#236a4c] bg-[#003931] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm text-[#00d497]"><Copy size={15} /> Copy this key now. It will not be shown again.</div>
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#7ee6bd]">{projectId || "new project"}</p>
      <pre className="overflow-auto border border-[#236a4c] bg-[#080f11] p-3 text-xs text-[#e7eaeb]"><code>{apiKey}</code></pre>
    </section>
  );
}

function CreateProjectForm() {
  return (
    <form action="/api/admin/projects" method="post" className="border border-[#292f31] bg-[#101618] p-5">
      <input type="hidden" name="action" value="create_project" />
      <p className="wall-kicker">Create project</p>
      <div className="mt-4 grid gap-3">
        <input name="project_id" required placeholder="project_id e.g. agenthub" className="min-h-11 border border-[#292f31] bg-[#0d1316] px-3 font-mono text-xs text-[#e7eaeb] outline-none focus:border-[#00d497]" />
        <input name="project_name" placeholder="Display name" className="min-h-11 border border-[#292f31] bg-[#0d1316] px-3 text-sm text-[#e7eaeb] outline-none focus:border-[#00d497]" />
        <button className="wall-button wall-button-primary justify-center" type="submit"><Plus size={15} /> Create</button>
      </div>
    </form>
  );
}

function CreateKeyForm({ projects }: { projects: { projectId: string; projectName: string }[] }) {
  return (
    <form action="/api/admin/projects" method="post" className="border border-[#292f31] bg-[#101618] p-5">
      <input type="hidden" name="action" value="create_key" />
      <p className="wall-kicker">Generate key</p>
      <div className="mt-4 grid gap-3">
        <input name="project_id" required list="wallbox-projects" placeholder="project_id" className="min-h-11 border border-[#292f31] bg-[#0d1316] px-3 font-mono text-xs text-[#e7eaeb] outline-none focus:border-[#00d497]" />
        <datalist id="wallbox-projects">
          {projects.map((project) => <option key={project.projectId} value={project.projectId}>{project.projectName}</option>)}
        </datalist>
        <input name="project_name" placeholder="Display name if new" className="min-h-11 border border-[#292f31] bg-[#0d1316] px-3 text-sm text-[#e7eaeb] outline-none focus:border-[#00d497]" />
        <input name="label" placeholder="Key label e.g. Production SDK" className="min-h-11 border border-[#292f31] bg-[#0d1316] px-3 text-sm text-[#e7eaeb] outline-none focus:border-[#00d497]" />
        <button className="wall-button wall-button-primary justify-center" type="submit"><KeyRound size={15} /> Generate</button>
      </div>
    </form>
  );
}

function ProjectRow({ row }: { row: { projectId: string; projectName: string; source: string; keyId?: string; label?: string; maskedKey: string; keyHash: string; active: boolean; revokedAt?: string | null; stats: { total: number; verified: number; latest?: string } } }) {
  return (
    <article className="grid gap-4 bg-[#0d1316] p-5 lg:grid-cols-[.75fr_.8fr_.55fr_.55fr_.6fr_auto] lg:items-center">
      <div>
        <p className="text-sm text-[#e7eaeb]">{row.projectName}</p>
        <p className="mt-2 font-mono text-[11px] text-[#7e8385]">{row.projectId}</p>
      </div>
      <div>
        <p className="wall-mono text-xs text-[#e7eaeb]">{row.maskedKey}</p>
        <p className="mt-2 font-mono text-[11px] text-[#7e8385]">{row.label || `hash ${short(row.keyHash, 8, 4)}`}</p>
      </div>
      <p className="font-mono text-xs text-[#b8bdbf]">{row.source}</p>
      <p className={`font-mono text-xs ${row.active ? "text-[#00d497]" : "text-[#7e8385]"}`}>{row.active ? "active" : row.revokedAt ? "revoked" : "no key"}</p>
      <div>
        <p className="font-mono text-xs text-[#b8bdbf]">{row.stats.verified}/{row.stats.total} verified</p>
        <p className="mt-2 font-mono text-[11px] text-[#7e8385]">{row.stats.latest ? fmt(row.stats.latest) : "—"}</p>
      </div>
      {row.keyId && row.active ? (
        <div className="flex gap-2 lg:justify-end">
          <form action="/api/admin/projects" method="post">
            <input type="hidden" name="action" value="rotate_key" />
            <input type="hidden" name="key_id" value={row.keyId} />
            <button className="grid size-9 place-items-center border border-[#292f31] text-[#b8bdbf] hover:border-[#00d497] hover:text-[#00d497]" title="Rotate key" type="submit"><RotateCw size={14} /></button>
          </form>
          <form action="/api/admin/projects" method="post">
            <input type="hidden" name="action" value="revoke_key" />
            <input type="hidden" name="key_id" value={row.keyId} />
            <button className="grid size-9 place-items-center border border-[#292f31] text-[#b8bdbf] hover:border-[#febb55] hover:text-[#febb55]" title="Revoke key" type="submit"><Trash2 size={14} /></button>
          </form>
        </div>
      ) : <span className="hidden lg:block" />}
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
