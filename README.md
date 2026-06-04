# Wallbox

Verifiable flight recorder for autonomous AI agents.

Wallbox records every AI agent run as a tamper-evident audit capsule, stores the evidence through a Walrus-compatible blob interface, and anchors verification certificates through a Sui/Tatum-compatible certificate interface.

## MVP shipped in this repo

- Deterministic `RiskLens Demo Agent`
- Canonical audit capsule builder with reproducible SHA-256 hashing
- Local/Walrus blob store abstraction
- Local/Sui-Tatum certificate abstraction
- Public verification API and page
- Tamper demo that changes local capsule evidence and shows `TAMPERED`
- Cloudflare-inspired orange/cream/charcoal UI

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3070`.

## Demo flow

1. Open `/run`.
2. Click `Start run`.
3. Wallbox creates a trace, builds an audit capsule, stores a blob reference, and creates a certificate reference.
4. Open the returned verifier URL.
5. The verifier compares the anchored capsule hash with the recomputed capsule hash.
6. Call the tamper endpoint and open the tampered verifier URL:

```bash
curl -X POST http://localhost:3070/api/demo/tamper/<run_id>
```

The status changes to `TAMPERED` and the changed file is highlighted.

## Modes

Default `.env.example` uses local fallback modes so the demo works without secrets:

```bash
WALLBOX_BLOB_STORE_MODE=local
WALLBOX_CERTIFICATE_MODE=local
```

Production/hackathon integration targets:

```bash
WALLBOX_BLOB_STORE_MODE=walrus
WALLBOX_CERTIFICATE_MODE=sui-tatum
WALRUS_PUBLISHER_URL=
WALRUS_AGGREGATOR_URL=
TATUM_API_KEY=
TATUM_SUI_RPC_URL=
SUI_PRIVATE_KEY=
SUI_PACKAGE_ID=
```

Local mode is clearly labeled in API/UI responses. It uses the same data model and interfaces as the real integrations, but does not claim to be an on-chain certificate or real Walrus blob.

## API

- `POST /api/runs` — run deterministic demo agent, build/store/certify capsule
- `GET /api/runs/:runId` — inspect run and capsule evidence
- `GET /api/verify/:certificateId` — verify certificate and capsule integrity
- `POST /api/demo/tamper/:runId` — modify local cached capsule for tamper demo

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
