# Wallbox

Verifiable flight recorder for autonomous AI agents.

Wallbox records every AI agent run as a tamper-evident audit capsule, stores the evidence through a Walrus-compatible blob interface, and anchors verification certificates through a Sui/Tatum-compatible certificate interface.

## Live demo

- App: `https://wallbox.hanslabs.xyz`
- Judge flow: `https://wallbox.hanslabs.xyz/demo`
- Status: `https://wallbox.hanslabs.xyz/status`
- Run history: `https://wallbox.hanslabs.xyz/runs`

## MVP shipped in this repo

- Deterministic `RiskLens Demo Agent`
- Canonical audit capsule builder with reproducible SHA-256 hashing
- Walrus testnet blob storage in production, with local fallback mode
- Sui/Tatum testnet certificate anchoring in production, with local fallback mode
- Sui Move certificate package scaffold in `move/wallbox`
- Tatum `sui_getObject` certificate parser with tests
- Public verification API and page
- `/demo` judge page showing latest verified run, Walrus blob, Sui object/tx, hash match, and tamper CTA
- One-click tamper demo that changes local capsule evidence and shows `TAMPERED`
- SQLite run storage at `data/wallbox.sqlite`, with legacy JSON backup/export files in `data/runs/`
- Admin console for project-scoped API keys: create project, generate key, rotate key, revoke key
- TypeScript SDK in `packages/sdk`
- MCP server in `packages/mcp-server`
- Oxide-inspired dark infra console UI

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3070`.

## Demo flow

1. Open `/demo` for the one-screen judge view, or `/run` to create a fresh run.
2. Click `Run demo` / `Start run`.
3. Wallbox creates a trace, builds an audit capsule, stores a Walrus blob, and creates a Sui/Tatum certificate.
4. Open the verifier URL.
5. The verifier compares the anchored capsule hash with the recomputed capsule hash.
6. Click `Simulate tampering` to open `/verify/local-tampered/<run_id>` and show `TAMPERED`.

Manual tamper endpoint:

```bash
curl -X POST http://localhost:3070/api/demo/tamper/<run_id>
```

## Modes

Default `.env.example` uses local fallback modes so the demo works without secrets:

```bash
WALLBOX_BLOB_STORE_MODE=local
WALLBOX_CERTIFICATE_MODE=local
```

Production/hackathon integration targets stay on **testnet first**:

```bash
WALLBOX_BLOB_STORE_MODE=walrus
WALLBOX_CERTIFICATE_MODE=sui-tatum
WALRUS_NETWORK=testnet
SUI_NETWORK=testnet
WALRUS_PUBLISHER_URL=
WALRUS_AGGREGATOR_URL=
TATUM_API_KEY=
TATUM_SUI_RPC_URL=
SUI_PRIVATE_KEY=
SUI_PACKAGE_ID=
```

Mainnet is blocked unless `WALLBOX_ALLOW_MAINNET=true` is explicitly set after funds, monitoring, and operational ownership are ready.

Local mode is clearly labeled in API/UI responses. It uses the same data model and interfaces as the real integrations, but does not claim to be an on-chain certificate or real Walrus blob.

## Storage

Runtime storage is SQLite:

```bash
WALLBOX_SQLITE_PATH=data/wallbox.sqlite
```

On startup, Wallbox imports old `data/runs/*.json` records into SQLite and keeps JSON files as operational backup/export records.

## Project-scoped API keys

External agent capture is protected by API keys.

Legacy env keys still work:

```bash
WALLBOX_API_KEY=wbx_default_secret
WALLBOX_API_KEYS="agenthub=wbx_agenthub, meridian|Meridian Bot|wbx_meridian"
```

The admin console can also create SQLite-backed projects and keys at `/admin`:

- create project
- generate one-time key
- rotate key
- revoke key
- view run counts per project

External requests send either:

```bash
x-wallbox-api-key: <key>
Authorization: Bearer <key>
```

## Sui Move package

The intended certificate object lives in `move/wallbox`:

- `Move.toml`
- `sources/certificate.move`

It defines `AgentRunCertificate` and `CertificateCreated`. The testnet package is deployed and production uses the Sui CLI signer to call `create_certificate`.

## API

- `POST /api/runs` — run deterministic demo agent or capture an external agent run
- `GET /api/runs?limit=100` — list runs; scoped by project API key when provided
- `GET /api/runs/:runId` — inspect run and capsule evidence
- `GET /api/verify/:certificateId` — verify certificate and capsule integrity
- `POST /api/demo/tamper/:runId` — modify local cached capsule for tamper demo
- `POST /api/admin/projects` — admin-only project/key actions

## SDK and MCP

SDK:

```ts
import { WallboxClient } from "@wallbox/sdk";

const wallbox = new WallboxClient({
  baseUrl: "https://wallbox.hanslabs.xyz",
  apiKey: process.env.WALLBOX_API_KEY!,
});

await wallbox.captureRun({ mode: "external", task, agent, trace, artifacts });
```

MCP server:

```yaml
mcp_servers:
  wallbox:
    command: "node"
    args: ["/root/wallbox/packages/mcp-server/dist/index.js"]
    env:
      WALLBOX_BASE_URL: "https://wallbox.hanslabs.xyz"
      WALLBOX_API_KEY: "wbx_project_key"
```

## Verification model

Wallbox verifies evidence integrity. It proves that a fetched capsule matches the anchored hash. It does not prove the agent was correct, honest, unbiased, or complete.

## Docs

- Product requirements: [`prd.md`](./prd.md)
- Architecture: [`docs/architecture.md`](./docs/architecture.md)
- Design system: [`docs/design-system.md`](./docs/design-system.md)
- Hackathon checklist: [`docs/hackathon-checklist.md`](./docs/hackathon-checklist.md)
- Demo script: [`docs/demo-script.md`](./docs/demo-script.md)

## Build and test

```bash
pnpm test
pnpm build
```
