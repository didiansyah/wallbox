import { SourceRecord, ToolTraceEntry, VerdictRecord } from "@/lib/capsule/schema";
import { sha256CanonicalJson, sha256String } from "@/lib/capsule/hash";

export const DEMO_TASK = "Analyze whether an AI trading agent should be trusted with user funds.";
const BASE_TIME = "2026-06-04T00:00:00.000Z";
function ts(step: number) { return new Date(Date.parse(BASE_TIME) + step * 1000).toISOString(); }
export function createRunId() { return `run_${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0,14)}_${Math.random().toString(16).slice(2,8)}`; }
export function runDemoAgent(runId: string, task = DEMO_TASK) {
  const sources: SourceRecord[] = [
    { id:"src_001", type:"url", label:"AI trading risk controls", uri:"https://wallbox.local/sources/ai-trading-risk-controls", sha256:sha256String("audit logs, drawdown limits, approvals"), accessedAt:ts(2) },
    { id:"src_002", type:"api", label:"Static market context snapshot", uri:"wallbox://demo/market-context/sui", sha256:sha256String("volatile markets require traceable inputs"), accessedAt:ts(2) },
    { id:"src_003", type:"file", label:"Wallbox demo policy", uri:"wallbox://policy/wallbox-demo-policy-v1", sha256:sha256String("record trace, redact secrets, verify integrity"), accessedAt:ts(1) },
  ];
  const verdict: VerdictRecord = { verdict:"High risk unless the operator can prove strategy limits, data sources, and execution history.", riskLevel:"high", summary:"The agent should not receive custody or autonomous trade rights without verifiable controls and tamper-evident run evidence.", requiredControls:["signed strategy config","archived market snapshots","full tool trace","immutable run certificate","human approval for large trades"] };
  const finalReport = `# AI Trading Agent Trust Review\n\n## Verdict\n${verdict.verdict}\n\n## Key Risks\n- black-box decisions\n- prompt/policy drift\n- unverified data sources\n- missing trade replay\n- no independent audit trail\n\n## Required Controls\n${verdict.requiredControls.map(c => `- ${c}`).join("\n")}\n\n## Wallbox Evidence\nThis report was generated as part of Wallbox run ${runId}. The evidence bundle is designed for integrity verification, not truth verification.\n`;
  const trace: ToolTraceEntry[] = [
    { id:"trace_001", type:"tool_call", name:"load_policy", startedAt:ts(0), completedAt:ts(1), inputHash:sha256String(task), outputHash:sources[2].sha256, summary:"Loaded Wallbox demo redaction and capture policy." },
    { id:"trace_002", type:"tool_call", name:"fetch_market_context", startedAt:ts(1), completedAt:ts(2), inputHash:sha256CanonicalJson({task}), outputHash:sha256CanonicalJson(sources), summary:"Fetched static source records for AI trading agent risk context." },
    { id:"trace_003", type:"decision", name:"evaluate_risk_controls", startedAt:ts(2), completedAt:ts(3), inputHash:sha256CanonicalJson(sources), outputHash:sha256CanonicalJson(verdict), summary:"Checked audit logs, max drawdown, approvals, and source traceability." },
    { id:"trace_004", type:"model_step", name:"generate_final_report", startedAt:ts(3), completedAt:ts(4), inputHash:sha256CanonicalJson(verdict), outputHash:sha256String(finalReport), summary:"Generated deterministic markdown trust review." },
    { id:"trace_005", type:"tool_call", name:"build_wallbox_capsule", startedAt:ts(4), completedAt:ts(5), inputHash:sha256String(finalReport), summary:"Packaged trace, sources, verdict, and final report into an audit capsule." },
  ];
  return { runId, task, startedAt:ts(0), completedAt:ts(5), trace, sources, verdict, finalReport };
}
