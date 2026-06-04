# Wallbox

Verifiable flight recorder for autonomous AI agents.

Wallbox records AI agent runs as tamper-evident audit capsules, stores the evidence on Walrus, and anchors verification certificates on Sui through Tatum.

## Core idea

AI agents can browse, trade, write code, call APIs, and make decisions. But when something goes wrong, there is usually no independent evidence trail. Wallbox captures the run context, tool calls, sources, artifacts, and final output into a verifiable capsule.

## MVP scope

- Run deterministic demo agent
- Build audit capsule
- Hash all evidence deterministically
- Upload capsule to Walrus
- Certify capsule hash and blob ID on Sui through Tatum
- Verify certificate by fetching Walrus data and recomputing hash

## Docs

- Product requirements: [`prd.md`](./prd.md)

## Hackathon pitch

> AI agents need accountability. Wallbox gives every agent a black box: evidence on Walrus, certificate on Sui, access through Tatum.
