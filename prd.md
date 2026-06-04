# Wallbox Product Requirements Document

> **For Hermes:** Use `subagent-driven-development` skill to implement this plan task-by-task.

**Product name:** Wallbox  
**Tagline:** Verifiable flight recorder for autonomous AI agents.  
**One-liner:** Wallbox records every AI agent run as a tamper-evident audit capsule, stores the evidence on Walrus, and anchors verification certificates on Sui through Tatum.

---

## 1. Context & Opportunity

AI agents are moving from chat assistants into autonomous workers: they browse, trade, write code, generate reports, call APIs, and make business decisions. The missing layer is accountability. When an agent gives a wrong recommendation, fabricates a source, loses money, changes behavior after an update, or produces a disputed output, users currently have no reliable way to inspect what happened.

Wallbox turns each AI agent session into an auditable evidence package:

- What was the user task?
- What system/policy prompt was active?
- Which model/version produced the output?
- What tools were called?
- What sources/files/API responses were used?
- What output was produced?
- Was the evidence modified after the run?
- Can another party verify the run without trusting our backend?

The Tatum x Walrus hackathon rewards meaningful Walrus + Sui usage. Wallbox uses Walrus as the evidence storage layer and Sui as the certificate/verification layer, accessed through Tatum RPC/tools.

---

## 2. Hackathon Fit

### Hackathon requirements alignment

- **Tatum API key / Sui RPC:** used to write/read the Wallbox certificate object on Sui.
- **Meaningful Walrus storage:** full audit capsules are stored on Walrus, not just static media.
- **Sui mainnet/testnet/devnet:** MVP should target Sui testnet/devnet first; mainnet if setup and funds are ready.
- **MCP optional but encouraged:** Wallbox can expose a small AI-verifier flow that uses Tatum MCP/tooling to inspect a Sui object and verify a Walrus capsule.
- **Submission:** GitHub repo + 2–3 minute demo video.

### Judging criteria mapping

- **Walrus + Tatum Integration (30%):** Audit capsule stored on Walrus; Sui certificate created/read through Tatum RPC.
- **Technical Quality (30%):** Deterministic hashing, reproducible verification, clean API boundaries, simple UI.
- **Creativity (20%):** Not another AI memory agent; Wallbox is an accountability layer for agents.
- **Presentation (20%):** Strong story: “AI agents need a black box.”

---

## 3. Product Vision

Wallbox becomes the default “black box” layer for agentic systems.

Any AI agent framework, trading bot, research agent, coding agent, or enterprise automation tool can call Wallbox to produce a verifiable audit capsule after each run.

Long-term, Wallbox can support:

- public verification pages,
- private/encrypted audit rooms,
- agent benchmark history,
- behavior drift monitoring,
- compliance exports,
- dispute resolution,
- DAO/governance accountability,
- AI trading strategy audit trails,
- enterprise AI risk management.

For hackathon MVP, scope stays narrow: create, store, certify, and verify one audit capsule.

---

## 4. Target Users

### 4.1 AI Agent Builders

Developers building autonomous agents need a way to prove what their agent did. They want a lightweight SDK/API to record sessions and generate audit certificates.

Pain points:

- hard to debug agent behavior,
- tool traces scattered across logs,
- outputs cannot be independently verified,
- no trust layer for users/investors/judges.

### 4.2 Crypto / DeFi Teams

Trading agents, research bots, and DeFi automation systems need transparent evidence for decisions.

Pain points:

- users distrust black-box trading bots,
- strategy changes are hard to audit,
- market snapshots and decision logic disappear,
- disputes over whether a bot followed its mandate.

### 4.3 Enterprise AI / Compliance Teams

Organizations deploying agents need auditability before allowing agents to touch sensitive workflows.

Pain points:

- compliance asks “why did the agent do this?”,
- logs are centralized and mutable,
- model/prompt/tool versions are not tracked consistently,
- incident response needs complete evidence.

### 4.4 Hackathon Judges / Ecosystem Builders

Judges want to see a clear, working example of Walrus + Sui + Tatum solving a real problem.

Pain points:

- many submissions are generic uploaders,
- difficult to see meaningful Walrus usage,
- demos often lack credible future product potential.

---

## 5. Core Product Narrative

### Pitch

> AI agents will soon move money, write code, publish research, and run business workflows. But when they fail, there is no black box. Wallbox is a verifiable flight recorder for autonomous agents: it captures prompts, tool calls, sources, outputs, and artifacts into an audit capsule stored on Walrus, then anchors a certificate on Sui through Tatum. Anyone can verify later that the evidence is complete and untampered.

### Demo hook

1. Run an agent task.
2. Watch Wallbox capture the trace.
3. Store the capsule on Walrus.
4. Mint/register a certificate on Sui through Tatum.
5. Open public verify page.
6. Tamper with local data; verification fails.

---

## 6. MVP Scope

### 6.1 In scope for hackathon

- Landing/dashboard page explaining Wallbox.
- Run a sample agent task.
- Generate deterministic audit capsule.
- Upload audit capsule to Walrus.
- Store certificate metadata on Sui using Tatum RPC.
- Display capsule details and verification status.
- Verify a capsule by fetching from Walrus and comparing hashes with Sui certificate.
- Provide GitHub-ready README and demo instructions.

### 6.2 Out of scope for hackathon

- Full production auth.
- Paid plans.
- Complex multi-agent orchestration.
- Real-time streaming traces.
- Advanced cryptography beyond content hashing.
- Full Seal encryption integration.
- DAO governance.
- Marketplace.
- Enterprise SSO.

---

## 7. Key Features

## Feature 1: Agent Run Recorder

### Description

Wallbox runs or receives an AI-agent task and records the full run into a structured trace.

### MVP behavior

The MVP can use a deterministic sample “Research Agent” or “DeFi Risk Agent” rather than relying on a complex live LLM flow.

Sample task:

> “Analyze whether an AI trading agent should be trusted with user funds.”

The recorder captures:

- run ID,
- agent name,
- model/provider label,
- task text hash,
- system prompt hash,
- start/end timestamps,
- tool calls,
- source URLs,
- final output hash,
- artifacts.

### Acceptance criteria

- A run creates a unique `run_id`.
- Recorder creates `manifest.json`.
- Recorder creates `trace.jsonl`.
- Recorder creates at least one artifact, e.g. `final_report.md`.
- Hashes are deterministic and reproducible.

---

## Feature 2: Audit Capsule Builder

### Description

The capsule builder packages a run into a canonical archive/folder with stable hashing rules.

### Capsule structure

```txt
capsule/
  manifest.json
  trace.jsonl
  sources.json
  verdict.json
  artifacts/
    final_report.md
```

### Manifest fields

```json
{
  "schema_version": "wallbox.audit_capsule.v1",
  "run_id": "run_20260604_001",
  "agent": {
    "id": "research-agent-demo",
    "name": "Research Agent Demo",
    "version": "0.1.0"
  },
  "model": {
    "provider": "demo",
    "name": "deterministic-demo-agent",
    "version": "0.1.0"
  },
  "task": {
    "plaintext_preview": "Analyze whether an AI trading agent should be trusted with user funds.",
    "sha256": "0x..."
  },
  "policy": {
    "system_prompt_sha256": "0x...",
    "policy_version": "wallbox-demo-policy-v1"
  },
  "timing": {
    "started_at": "2026-06-04T00:00:00.000Z",
    "completed_at": "2026-06-04T00:00:05.000Z"
  },
  "files": [
    {
      "path": "trace.jsonl",
      "sha256": "0x...",
      "bytes": 1234
    },
    {
      "path": "sources.json",
      "sha256": "0x...",
      "bytes": 456
    },
    {
      "path": "artifacts/final_report.md",
      "sha256": "0x...",
      "bytes": 789
    }
  ],
  "capsule_hash": "0x..."
}
```

### Hashing rule

For MVP:

1. Serialize JSON with sorted keys.
2. Hash each file with SHA-256.
3. Build manifest without `capsule_hash`.
4. Hash canonical manifest + file hashes.
5. Store final `capsule_hash` in manifest.

### Acceptance criteria

- Re-running verification on the same capsule produces the same capsule hash.
- Any artifact change causes verification failure.
- Missing file causes verification failure.

---

## Feature 3: Walrus Storage Integration

### Description

Wallbox stores the audit capsule on Walrus and returns a Walrus blob ID/object reference.

### MVP implementation options

Preferred:

- Use Walrus TypeScript SDK if fastest.

Fallback:

- Use Walrus publisher HTTP API:
  - `PUT /v1/blobs`
- Use aggregator HTTP API for reading:
  - `GET /v1/blobs/<BLOB_ID>`

### Data to store

For MVP, store either:

- a zipped/tarred capsule archive, or
- one JSON object containing manifest + trace + sources + artifacts.

The simplest hackathon version should store one JSON bundle:

```json
{
  "manifest": {},
  "trace": [],
  "sources": [],
  "verdict": {},
  "artifacts": {
    "final_report.md": "...markdown content..."
  }
}
```

### Acceptance criteria

- Backend uploads capsule to Walrus.
- Backend receives and stores `walrus_blob_id`.
- Verification flow can fetch the capsule back from Walrus.
- UI displays the Walrus blob ID and explorer/docs link if available.

---

## Feature 4: Sui Certificate via Tatum

### Description

Wallbox creates a Sui-side certificate that anchors the audit capsule metadata.

### MVP certificate data

If implementing a Move package is too slow, use the fastest available path to create/record an on-chain object or transaction memo-like record through Sui/Tatum. If a custom Move object is feasible, use the object structure below.

### Preferred Move object

```move
module wallbox::certificate {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::String;

    public struct AgentRunCertificate has key, store {
        id: UID,
        run_id: String,
        agent_id: String,
        capsule_hash: String,
        walrus_blob_id: String,
        schema_version: String,
        created_at_ms: u64
    }

    public struct CertificateCreated has copy, drop {
        certificate_id: address,
        run_id: String,
        agent_id: String,
        capsule_hash: String,
        walrus_blob_id: String
    }

    public entry fun create_certificate(
        run_id: String,
        agent_id: String,
        capsule_hash: String,
        walrus_blob_id: String,
        schema_version: String,
        created_at_ms: u64,
        ctx: &mut TxContext
    ) {
        let cert = AgentRunCertificate {
            id: object::new(ctx),
            run_id,
            agent_id,
            capsule_hash,
            walrus_blob_id,
            schema_version,
            created_at_ms
        };

        event::emit(CertificateCreated {
            certificate_id: object::uid_to_address(&cert.id),
            run_id: cert.run_id,
            agent_id: cert.agent_id,
            capsule_hash: cert.capsule_hash,
            walrus_blob_id: cert.walrus_blob_id
        });

        transfer::public_transfer(cert, tx_context::sender(ctx));
    }
}
```

### Tatum usage

Use Tatum Sui RPC endpoint to:

- submit certificate transaction,
- read certificate object,
- query transaction status,
- fetch object fields for verification.

### Acceptance criteria

- A successful run creates a Sui certificate or transaction.
- UI displays Sui transaction/object ID.
- Verify page can read on-chain certificate data through Tatum RPC.
- Capsule hash from Walrus matches hash stored on Sui.

---

## Feature 5: Verification Page

### Description

Public page where anyone can verify a Wallbox certificate.

### Route

```txt
/verify/:certificateId
```

### Verification steps

1. Fetch Sui certificate object through Tatum RPC.
2. Extract `walrus_blob_id` and `capsule_hash`.
3. Fetch capsule from Walrus.
4. Recompute file hashes and capsule hash.
5. Compare recomputed hash with Sui certificate hash.
6. Show status.

### Status states

- `VERIFIED`: hash matches and all files are present.
- `TAMPERED`: hash mismatch.
- `MISSING_BLOB`: Walrus blob cannot be fetched.
- `INVALID_SCHEMA`: capsule schema invalid.
- `CERTIFICATE_NOT_FOUND`: Sui object not found.

### UI copy

Verified state:

> This agent run is verified. The Walrus audit capsule matches the Sui certificate created through Tatum.

Tampered state:

> Verification failed. The capsule contents no longer match the hash anchored on Sui.

---

## Feature 6: Demo Tamper Test

### Description

A strong demo moment where verification fails after data modification.

### MVP approach

Add a local dev-only API endpoint:

```txt
POST /api/demo/tamper/:runId
```

It modifies the cached capsule or artifact content locally. Then verification recomputes the hash and shows `TAMPERED`.

If direct Walrus blob immutability makes tampering impossible, simulate by verifying against a modified local capsule or by showing a “malicious uploaded clone” with same claimed certificate but altered content.

### Acceptance criteria

- Demo can show a verified capsule.
- Demo can show a tampered capsule failure.
- README explains this is a local demo of verification logic, not mutation of Walrus immutable data.

---

## 8. UX / UI Requirements

Wallbox must use a **Cloudflare-inspired UI/UX**, not Midday style. The product should feel like infrastructure: fast, sharp, credible, slightly technical, and enterprise-ready.

### Cloudflare design direction

- **Visual mood:** infrastructure-grade, developer-friendly, security-focused, operational.
- **Palette:** Cloudflare orange + warm cream + charcoal, with restrained neutral surfaces.
- **Typography:** clean sans-serif, preferably Inter/Geist/System; avoid serif headlines for this project.
- **Layout:** technical landing page with sharp product panels, network/grid motifs, status cards, API snippets, and verification dashboards.
- **Hero feel:** bold infrastructure promise + product console preview.
- **Cards:** low-radius or medium-radius cards, subtle borders, warm off-white backgrounds, orange accents.
- **Icons:** Lucide line icons only; no emoji in UI.
- **Motion:** subtle status pulses, certificate verification progress, network line animations; avoid playful SaaS animations.
- **Do not use:** blue/teal tints, glossy gradients, cartoon illustrations, generic AI orb visuals, or Midday serif-heavy styling.

### Color tokens

Light mode:

```css
--background: #fff7ed;          /* warm cream */
--foreground: #111111;          /* charcoal */
--primary: #f6821f;             /* Cloudflare orange */
--primary-foreground: #111111;
--secondary: #ffffff;
--secondary-foreground: #111111;
--accent: #faae40;              /* warm orange accent */
--accent-foreground: #111111;
--muted: #f5eadc;
--muted-foreground: #6b5f55;
--card: #ffffff;
--card-foreground: #111111;
--border: #eadccf;
--ring: #f6821f;
--success: #15803d;
--warning: #b45309;
--destructive: #b91c1c;
```

Dark mode:

```css
--background: #0f0b08;
--foreground: #fff7ed;
--primary: #f6821f;
--primary-foreground: #111111;
--secondary: #1a1410;
--secondary-foreground: #fff7ed;
--accent: #faae40;
--accent-foreground: #111111;
--muted: #241a14;
--muted-foreground: #b8a99b;
--card: #17110d;
--card-foreground: #fff7ed;
--border: #33261d;
--ring: #f6821f;
--success: #22c55e;
--warning: #f59e0b;
--destructive: #ef4444;
```

Tailwind v4 dark mode:

```css
@custom-variant dark (&:is(.dark *));
```

### Cloudflare-style component patterns

#### Header

- Sticky top header with warm cream/white blur.
- Left: Wallbox wordmark.
- Center: docs/product/security/use-cases links.
- Right: “Verify certificate” secondary button + “Run demo” orange primary button.
- Use compact height and strong borders; feels like infra product, not lifestyle SaaS.

#### Hero

- Left column: headline, short copy, CTAs, small trust/status row.
- Right column: product console preview.
- Add subtle grid/dot network background in cream/orange/charcoal.
- Headline example: “The black box for autonomous AI agents.”
- Subheadline example: “Capture every prompt, tool call, source, artifact, and output into verifiable evidence stored on Walrus and certified on Sui through Tatum.”

#### Product console preview

Create a dark console-style panel with:

- Run ID
- Agent status
- Capsule hash
- Walrus blob ID
- Sui certificate ID
- Verification state
- File integrity checks

Use orange status chips for active steps and green only for verified/success states.

#### Cards

- Use `border: 1px solid var(--border)`.
- Use warm off-white surfaces.
- Radius: `12px` to `16px`; avoid overly rounded pill-heavy Midday look.
- Top accents can use 2px orange border or left orange rail.

#### API/code blocks

- Dark charcoal background.
- Orange highlights for keys/status.
- Monospace font.
- Use code examples as part of the UI story.

#### Verification states

- `VERIFIED`: green check line icon, green text, but keep orange/charcoal overall brand.
- `TAMPERED`: red alert line icon.
- `MISSING_BLOB`: amber warning.
- `INVALID_SCHEMA`: amber warning.
- `CERTIFICATE_NOT_FOUND`: neutral/amber.

#### Background motifs

Use subtle Cloudflare-like infrastructure motifs:

- global edge/network map abstraction,
- dotted grid,
- thin connection lines,
- request pipeline cards,
- certificate chain cards.

Keep motifs subtle; product screenshots/console panels should dominate.

### Key pages

#### Landing page `/`

Sections:

1. Hero
   - Headline: “The black box for autonomous AI agents.”
   - Subheadline: “Wallbox captures prompts, tool calls, sources, outputs, and artifacts into verifiable audit capsules stored on Walrus and certified on Sui through Tatum.”
   - CTA: “Run demo agent”
   - Secondary CTA: “Verify certificate”
2. Problem
   - “AI agents act, but nobody can audit them.”
3. How it works
   - Record
   - Store
   - Certify
   - Verify
4. Dashboard mockup
   - run status,
   - Walrus blob ID,
   - Sui certificate ID,
   - verification status.
5. Use cases
   - AI trading agents,
   - research agents,
   - coding agents,
   - enterprise workflows.

#### Run page `/run`

- Task selector.
- Start run button.
- Live-ish progress cards:
  - generating trace,
  - building capsule,
  - uploading to Walrus,
  - certifying on Sui,
  - verified.
- Link to capsule detail.

#### Capsule detail `/capsules/:runId`

- Run summary.
- Agent metadata.
- Tool trace table/cards.
- Source list.
- Artifact preview.
- Walrus blob ID.
- Sui certificate object/tx.
- Verify CTA.

#### Verify page `/verify/:certificateId`

- Large verification status.
- Sui certificate fields.
- Walrus capsule hash.
- Recomputed hash.
- File integrity checklist.
- Artifact preview.

---

## 9. Technical Architecture

## 9.1 Recommended stack

Use the existing HANS Labs pattern:

- Frontend: Next.js 16 / React / TypeScript
- UI: shadcn/ui or Base UI pattern, Lucide icons
- Styling: Tailwind v4
- Backend: FastAPI or Next.js API routes
- Storage: local dev files + Walrus
- Chain: Sui via Tatum RPC
- DB for MVP: SQLite or local JSON file; upgrade later to MariaDB

For speed, a single Next.js app with API routes may be fastest for hackathon.

## 9.2 Proposed directory structure

```txt
/root/wallbox/
  README.md
  prd.md
  .env.example
  package.json
  src/
    app/
      page.tsx
      run/page.tsx
      capsules/[runId]/page.tsx
      verify/[certificateId]/page.tsx
      api/
        runs/route.ts
        runs/[runId]/route.ts
        walrus/upload/route.ts
        sui/certify/route.ts
        verify/[certificateId]/route.ts
    components/
      landing/
      dashboard/
      verification/
      ui/
    lib/
      capsule/
        build-capsule.ts
        hash.ts
        schema.ts
        verify-capsule.ts
      agent/
        demo-agent.ts
        trace-recorder.ts
      walrus/
        client.ts
      sui/
        tatum-client.ts
        certificate.ts
      storage/
        local-store.ts
  move/
    wallbox/
      Move.toml
      sources/certificate.move
  data/
    runs/.gitkeep
  docs/
    demo-script.md
    architecture.md
```

---

## 10. API Specification

## 10.1 Create agent run

```txt
POST /api/runs
```

Request:

```json
{
  "task_type": "ai_agent_trust_demo",
  "task": "Analyze whether an AI trading agent should be trusted with user funds."
}
```

Response:

```json
{
  "run_id": "run_20260604_001",
  "status": "completed",
  "capsule_hash": "0x...",
  "walrus_blob_id": "...",
  "sui_certificate_id": "0x...",
  "sui_tx_digest": "...",
  "verify_url": "/verify/0x..."
}
```

## 10.2 Get run

```txt
GET /api/runs/:runId
```

Response:

```json
{
  "run_id": "run_20260604_001",
  "status": "completed",
  "manifest": {},
  "trace": [],
  "sources": [],
  "artifacts": {},
  "walrus_blob_id": "...",
  "sui_certificate_id": "0x..."
}
```

## 10.3 Verify certificate

```txt
GET /api/verify/:certificateId
```

Response:

```json
{
  "status": "VERIFIED",
  "certificate_id": "0x...",
  "walrus_blob_id": "...",
  "onchain_capsule_hash": "0x...",
  "recomputed_capsule_hash": "0x...",
  "files": [
    {
      "path": "manifest.json",
      "status": "OK",
      "sha256": "0x..."
    }
  ]
}
```

## 10.4 Demo tamper check

```txt
POST /api/demo/tamper/:runId
```

Response:

```json
{
  "run_id": "run_20260604_001",
  "tampered": true,
  "verify_url": "/verify/local-tampered/run_20260604_001"
}
```

---

## 11. Environment Variables

```bash
# Tatum
TATUM_API_KEY=
TATUM_SUI_RPC_URL=
SUI_NETWORK=testnet

# Sui wallet / package
SUI_PRIVATE_KEY=
SUI_PACKAGE_ID=
SUI_CERTIFICATE_MODULE=certificate

# Walrus
WALRUS_PUBLISHER_URL=
WALRUS_AGGREGATOR_URL=
WALRUS_NETWORK=testnet

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
WALLBOX_STORAGE_DIR=./data/runs
```

Security note: never expose private keys or Tatum API keys to the browser.

---

## 12. Data Model

## 12.1 Local Run Record

```ts
export type RunStatus =
  | "CREATED"
  | "AGENT_COMPLETED"
  | "CAPSULE_BUILT"
  | "WALRUS_UPLOADED"
  | "SUI_CERTIFIED"
  | "VERIFIED"
  | "FAILED";

export type WallboxRun = {
  runId: string;
  status: RunStatus;
  task: string;
  taskHash: string;
  agentId: string;
  agentName: string;
  capsuleHash?: string;
  walrusBlobId?: string;
  suiCertificateId?: string;
  suiTxDigest?: string;
  createdAt: string;
  updatedAt: string;
  error?: string;
};
```

## 12.2 Audit Capsule

```ts
export type AuditCapsule = {
  manifest: AuditManifest;
  trace: ToolTraceEntry[];
  sources: SourceRecord[];
  verdict: VerdictRecord;
  artifacts: Record<string, string>;
};
```

## 12.3 Tool Trace Entry

```ts
export type ToolTraceEntry = {
  id: string;
  type: "tool_call" | "model_step" | "decision" | "error";
  name: string;
  inputHash?: string;
  outputHash?: string;
  startedAt: string;
  completedAt?: string;
  summary: string;
};
```

## 12.4 Source Record

```ts
export type SourceRecord = {
  id: string;
  type: "url" | "file" | "api" | "chain_object";
  label: string;
  uri: string;
  sha256?: string;
  accessedAt: string;
};
```

---

## 13. Verification Logic

## 13.1 `sha256CanonicalJson(value)`

Rules:

- Sort object keys recursively.
- Preserve array order.
- Encode as UTF-8.
- Return `0x` prefixed SHA-256.

## 13.2 `buildCapsuleHash(capsule)`

Rules:

1. Hash every artifact string.
2. Hash `trace`, `sources`, and `verdict` canonical JSON.
3. Build a file manifest.
4. Hash the canonical manifest payload.
5. Return `capsule_hash`.

## 13.3 `verifyCapsule(capsule, expectedHash)`

Return:

```ts
export type VerificationResult = {
  status: "VERIFIED" | "TAMPERED" | "INVALID_SCHEMA";
  expectedHash: string;
  actualHash: string;
  fileChecks: Array<{
    path: string;
    status: "OK" | "MISSING" | "MISMATCH";
    sha256?: string;
  }>;
};
```

---

## 14. Demo Agent Design

The MVP demo agent should be deterministic to avoid demo failures.

### Agent name

`RiskLens Demo Agent`

### Task

“Analyze whether an AI trading agent should be trusted with user funds.”

### Simulated tool calls

1. `load_policy`
   - loads Wallbox demo policy.
2. `fetch_market_context`
   - uses static source records about AI trading risks.
3. `evaluate_risk_controls`
   - checks if agent has audit logs, max drawdown, human approval, source traceability.
4. `generate_final_report`
   - writes final markdown report.
5. `build_wallbox_capsule`
   - packages trace.

### Final report structure

```md
# AI Trading Agent Trust Review

## Verdict
High risk unless the operator can prove strategy limits, data sources, and execution history.

## Key Risks
- black-box decisions
- prompt/policy drift
- unverified data sources
- missing trade replay
- no independent audit trail

## Required Controls
- signed strategy config
- archived market snapshots
- full tool trace
- immutable run certificate
- human approval for large trades

## Wallbox Evidence
This report was generated as part of Wallbox run <run_id>.
```

---

## 15. Implementation Plan

## Phase 0: Repo setup

### Task 0.1: Create project scaffold

**Objective:** Create initial repository structure.

**Files:**

- Create: `README.md`
- Create: `prd.md`
- Create: `.env.example`
- Create: `docs/demo-script.md`

**Steps:**

1. Initialize Next.js TypeScript app.
2. Add Tailwind/shadcn or equivalent UI foundation.
3. Add Lucide icons.
4. Add base layout and design tokens.
5. Commit.

**Verification:**

```bash
npm run dev
```

Expected: landing page loads locally.

---

## Phase 1: Deterministic capsule engine

### Task 1.1: Add canonical hashing utility

**Objective:** Implement deterministic SHA-256 hashing for strings and canonical JSON.

**Files:**

- Create: `src/lib/capsule/hash.ts`
- Create: `src/lib/capsule/hash.test.ts`

**Acceptance criteria:**

- Same object with different key order produces same hash.
- Different artifact content produces different hash.

---

### Task 1.2: Add capsule schema

**Objective:** Define TypeScript types and validation for audit capsules.

**Files:**

- Create: `src/lib/capsule/schema.ts`

**Acceptance criteria:**

- Invalid capsule returns validation error.
- Valid demo capsule passes.

---

### Task 1.3: Add capsule builder

**Objective:** Convert a demo agent run into an audit capsule with manifest and hash.

**Files:**

- Create: `src/lib/capsule/build-capsule.ts`
- Create: `src/lib/capsule/build-capsule.test.ts`

**Acceptance criteria:**

- Builder outputs manifest, trace, sources, verdict, artifacts.
- `capsule_hash` exists.
- Hash is stable across repeated runs with same inputs.

---

### Task 1.4: Add capsule verifier

**Objective:** Recompute capsule hash and compare against expected hash.

**Files:**

- Create: `src/lib/capsule/verify-capsule.ts`
- Create: `src/lib/capsule/verify-capsule.test.ts`

**Acceptance criteria:**

- Valid capsule returns `VERIFIED`.
- Modified artifact returns `TAMPERED`.
- Missing required field returns `INVALID_SCHEMA`.

---

## Phase 2: Demo agent flow

### Task 2.1: Add demo agent

**Objective:** Generate deterministic trace and report for the sample task.

**Files:**

- Create: `src/lib/agent/demo-agent.ts`
- Create: `src/lib/agent/trace-recorder.ts`

**Acceptance criteria:**

- Running demo agent returns trace entries, sources, verdict, final report.
- Trace includes at least five steps.

---

### Task 2.2: Add local run store

**Objective:** Persist run metadata locally for demo.

**Files:**

- Create: `src/lib/storage/local-store.ts`
- Create: `data/runs/.gitkeep`

**Acceptance criteria:**

- Run can be saved and loaded by `run_id`.
- Store works without external DB.

---

### Task 2.3: Add create run API

**Objective:** Expose an endpoint that runs demo agent and builds capsule.

**Files:**

- Create: `src/app/api/runs/route.ts`
- Create: `src/app/api/runs/[runId]/route.ts`

**Acceptance criteria:**

- `POST /api/runs` returns a run ID and capsule hash.
- `GET /api/runs/:runId` returns run details.

---

## Phase 3: Walrus integration

### Task 3.1: Add Walrus client wrapper

**Objective:** Upload and fetch capsules from Walrus.

**Files:**

- Create: `src/lib/walrus/client.ts`

**Acceptance criteria:**

- `uploadCapsule(capsule)` returns `walrus_blob_id`.
- `fetchCapsule(blobId)` returns capsule JSON.
- If env vars are missing, client returns a clear setup error.

---

### Task 3.2: Wire Walrus upload into run API

**Objective:** Store capsule on Walrus after building it.

**Files:**

- Modify: `src/app/api/runs/route.ts`
- Modify: `src/lib/storage/local-store.ts`

**Acceptance criteria:**

- Successful run includes `walrus_blob_id`.
- Run record persists blob ID.
- UI/API clearly reports upload failure if Walrus is unavailable.

---

## Phase 4: Sui/Tatum integration

### Task 4.1: Add Tatum Sui RPC client

**Objective:** Wrap Sui object/transaction calls through Tatum RPC.

**Files:**

- Create: `src/lib/sui/tatum-client.ts`

**Acceptance criteria:**

- Client can call Sui RPC through Tatum.
- Missing `TATUM_API_KEY` produces clear setup error.

---

### Task 4.2: Add certificate Move package

**Objective:** Define the Sui certificate object for Wallbox runs.

**Files:**

- Create: `move/wallbox/Move.toml`
- Create: `move/wallbox/sources/certificate.move`

**Acceptance criteria:**

- Move package builds locally.
- `create_certificate` stores run ID, agent ID, capsule hash, Walrus blob ID, schema version, timestamp.

---

### Task 4.3: Add certificate service

**Objective:** Create and read Wallbox certificates through Tatum.

**Files:**

- Create: `src/lib/sui/certificate.ts`
- Modify: `src/app/api/runs/route.ts`

**Acceptance criteria:**

- Successful run includes `sui_certificate_id` or `sui_tx_digest`.
- Certificate stores the same capsule hash produced by the capsule builder.

---

## Phase 5: Verification flow

### Task 5.1: Add verification API

**Objective:** Verify a certificate by reading Sui + Walrus.

**Files:**

- Create: `src/app/api/verify/[certificateId]/route.ts`

**Acceptance criteria:**

- API fetches certificate data from Sui.
- API fetches capsule from Walrus.
- API recomputes capsule hash.
- API returns `VERIFIED`, `TAMPERED`, or error state.

---

### Task 5.2: Add verify page

**Objective:** Display verification result in a clear public page.

**Files:**

- Create: `src/app/verify/[certificateId]/page.tsx`
- Create: `src/components/verification/verification-card.tsx`

**Acceptance criteria:**

- Page displays status, hashes, blob ID, certificate ID, file checks.
- Verified state is visually obvious.
- Failure state explains what failed.

---

## Phase 6: UI polish and demo script

### Task 6.1: Build landing page

**Objective:** Create Cloudflare-inspired infrastructure landing page for Wallbox.

**Files:**

- Create/Modify: `src/app/page.tsx`
- Create: `src/components/landing/hero.tsx`
- Create: `src/components/landing/how-it-works.tsx`
- Create: `src/components/landing/dashboard-preview.tsx`

**Acceptance criteria:**

- Design uses Cloudflare-inspired orange/cream/charcoal palette.
- No emoji in UI; use Lucide line icons only.
- Headline uses clean sans-serif typography, not serif.
- CTAs use orange primary + charcoal/white secondary styling.
- Include infrastructure motifs: grid, edge/network lines, status cards, and console preview.

---

### Task 6.2: Build run page

**Objective:** Let user start a demo run and see progress.

**Files:**

- Create: `src/app/run/page.tsx`
- Create: `src/components/dashboard/run-panel.tsx`

**Acceptance criteria:**

- User can start demo run.
- User sees generated run ID, blob ID, certificate ID.
- User can click through to verification page.

---

### Task 6.3: Build capsule detail page

**Objective:** Display run evidence clearly.

**Files:**

- Create: `src/app/capsules/[runId]/page.tsx`
- Create: `src/components/dashboard/capsule-detail.tsx`

**Acceptance criteria:**

- Shows manifest summary.
- Shows trace entries.
- Shows sources.
- Shows final report preview.

---

### Task 6.4: Write README and demo script

**Objective:** Make the repo submission-ready.

**Files:**

- Modify: `README.md`
- Create/Modify: `docs/demo-script.md`
- Create: `docs/architecture.md`

**Acceptance criteria:**

- README explains setup, env vars, run commands, architecture.
- Demo script fits 2–3 minutes.
- Architecture doc explains Walrus + Sui + Tatum roles.

---

## 16. Demo Video Script

Target length: 2–3 minutes.

### 0:00–0:20 Problem

“AI agents are becoming autonomous. They browse, trade, call tools, and make decisions. But when something goes wrong, there is no black box.”

### 0:20–0:40 Product

“Wallbox is a verifiable flight recorder for AI agents. It captures prompts, tool calls, sources, outputs, and artifacts into an audit capsule.”

### 0:40–1:15 Run demo

“Here we run a demo risk agent. It analyzes whether an AI trading agent should be trusted with user funds. Wallbox records each step and builds an audit capsule.”

### 1:15–1:45 Walrus + Sui

“The capsule is uploaded to Walrus. Then Wallbox creates a Sui certificate through Tatum RPC containing the Walrus blob ID and capsule hash.”

### 1:45–2:20 Verify

“Anyone can open the verification page. Wallbox reads the Sui certificate, fetches the Walrus capsule, recomputes the hash, and proves whether the evidence is intact.”

### 2:20–2:45 Tamper proof

“If the capsule is modified, verification fails. That is the core value: autonomous agents become accountable.”

### 2:45–3:00 Close

“Wallbox is the black box layer for agentic systems, powered by Walrus, Sui, and Tatum.”

---

## 17. Success Metrics

### Hackathon success

- Working demo can create and verify a capsule end-to-end.
- README lets judges run locally.
- Demo video clearly shows Walrus + Sui + Tatum.
- Verification logic is understandable and compelling.

### Product success after hackathon

- 10 agent builders try the SDK/API.
- At least 3 agent frameworks can integrate Wallbox recorder.
- Wallbox supports private encrypted capsules.
- Wallbox can verify 1,000+ historical runs.
- Wallbox can generate compliance-ready exports.

---

## 18. Risks & Mitigations

### Risk: Walrus setup takes too long

Mitigation:

- Build local storage and verification first.
- Abstract Walrus client behind an interface.
- Add Walrus upload as final integration.
- Demo can show clear error state if network unavailable, but target should be real upload.

### Risk: Sui Move package slows implementation

Mitigation:

- Start with transaction/object metadata via fastest Tatum-supported route.
- Implement custom Move certificate only if time permits.
- Verification can still demonstrate reading a Sui transaction/object containing the anchored hash.

### Risk: Live LLM agent is unreliable

Mitigation:

- Use deterministic demo agent for hackathon.
- Label it as demo agent.
- Architecture supports real agents later.

### Risk: Verification feels abstract

Mitigation:

- Add tamper demo.
- Show file-by-file checks.
- Use a simple visual: on-chain hash vs recomputed hash.

### Risk: Judges think it is just logging

Mitigation:

- Emphasize independent verification.
- Show Walrus immutable evidence.
- Show Sui certificate hash anchoring.
- Explain why centralized logs are mutable and not enough.

---

## 19. Future Roadmap

### V1 after hackathon

- SDK for agent frameworks.
- Streaming trace capture.
- Real LLM provider integrations.
- Encrypted private capsules with Seal.
- Org/workspace support.
- Searchable run history.

### V2

- Behavior drift monitoring.
- Agent eval registry.
- Public trust score for agents.
- DeFi strategy audit mode.
- Dispute resolution workflow.
- Compliance exports.

### V3

- Marketplace of verified agents.
- Insurance/risk scoring integration.
- DAO governance and slashing for dishonest agents.
- Cross-chain certificate support.

---

## 20. Final Recommendation

Build Wallbox as a tight, high-signal hackathon MVP:

1. Deterministic demo agent.
2. Audit capsule builder.
3. Walrus upload.
4. Sui certificate via Tatum.
5. Public verification page.
6. Tamper-proof demo.

Do not overbuild. The winning story is simple:

> AI agents need accountability. Wallbox gives every agent a black box: evidence on Walrus, certificate on Sui, access through Tatum.
