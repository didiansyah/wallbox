import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { asJsonText, createClient, loadConfig, redactConfig } from "./config.js";

const TraceEntrySchema = z.object({
  id: z.string(),
  type: z.enum(["tool_call", "model_step", "decision", "error"]),
  name: z.string(),
  inputHash: z.string().optional(),
  outputHash: z.string().optional(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  summary: z.string(),
});

const SourceRecordSchema = z.object({
  id: z.string(),
  type: z.enum(["url", "file", "api", "chain_object"]),
  label: z.string(),
  uri: z.string(),
  sha256: z.string().optional(),
  accessedAt: z.string(),
});

const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string().optional(),
});

const ModelSchema = z.object({
  provider: z.string(),
  name: z.string(),
  version: z.string().optional(),
});

const VerdictSchema = z.object({
  verdict: z.string(),
  riskLevel: z.enum(["low", "medium", "high"]),
  summary: z.string(),
  requiredControls: z.array(z.string()),
});

export function createWallboxMcpServer() {
  const server = new McpServer({ name: "wallbox-mcp-server", version: "0.1.0" });
  const client = createClient();

  server.registerTool(
    "wallbox_capture_run",
    {
      title: "Capture Wallbox agent run",
      description: "Submit an external AI-agent trace to Wallbox. Returns run, Walrus, Sui, and verifier handles.",
      inputSchema: {
        run_id: z.string().optional(),
        task: z.string().min(1),
        started_at: z.string().optional(),
        completed_at: z.string().optional(),
        agent: AgentSchema,
        model: ModelSchema.optional(),
        trace: z.array(TraceEntrySchema).min(1),
        sources: z.array(SourceRecordSchema).optional(),
        verdict: VerdictSchema.optional(),
        artifacts: z.record(z.string(), z.string()).optional(),
      },
    },
    async (input) => asJsonText(await client.captureRun(input)),
  );

  server.registerTool(
    "wallbox_verify_certificate",
    {
      title: "Verify Wallbox certificate",
      description: "Verify a Wallbox Sui certificate ID or locally-known transaction digest against its Walrus audit capsule.",
      inputSchema: {
        certificate_id: z.string().min(1),
      },
    },
    async ({ certificate_id }) => asJsonText(await client.verifyCertificate(certificate_id)),
  );

  server.registerTool(
    "wallbox_get_run",
    {
      title: "Get Wallbox run",
      description: "Fetch a stored Wallbox run and its capsule details by run ID.",
      inputSchema: {
        run_id: z.string().min(1),
      },
    },
    async ({ run_id }) => asJsonText(await client.getRun(run_id)),
  );

  server.registerTool(
    "wallbox_list_runs",
    {
      title: "List Wallbox runs",
      description: "List recent Wallbox audit runs stored by the deployment.",
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional(),
      },
    },
    async ({ limit }) => asJsonText(await client.listRuns(limit ?? 20)),
  );

  server.registerTool(
    "wallbox_status",
    {
      title: "Wallbox MCP status",
      description: "Show MCP server configuration without exposing secrets.",
      inputSchema: {},
    },
    async () => asJsonText({ mcp: "ok", wallbox: redactConfig(loadConfig()) }),
  );

  return server;
}
