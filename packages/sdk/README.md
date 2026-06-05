# @wallbox/sdk

TypeScript client for submitting external AI-agent runs to Wallbox and verifying the resulting Sui/Walrus certificate.

## Install

```bash
npm install @wallbox/sdk
```

## Capture an agent run

```ts
import { WallboxClient } from "@wallbox/sdk";

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
    type: "decision",
    name: "final_answer",
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    summary: "Captured final decision and evidence."
  }],
  artifacts: { "final_report.md": "# Agent output\nEvidence captured by Wallbox." },
});

console.log(result.verify_url, result.sui_certificate_id);
```

## Verify a certificate

```ts
const verification = await wallbox.verifyCertificate(result.sui_certificate_id);
console.log(verification.status);
```

Keep `WALLBOX_API_KEY` server-side. Do not ship it in browser code.
