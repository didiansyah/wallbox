# Wallbox Hackathon Checklist

## Current live surface

- Live URL: `https://wallbox.hanslabs.xyz`
- Judge demo: `https://wallbox.hanslabs.xyz/demo`
- Status: `https://wallbox.hanslabs.xyz/status`
- Run history: `https://wallbox.hanslabs.xyz/runs`
- Admin: `https://wallbox.hanslabs.xyz/admin`

## Must ship

- [x] Deterministic demo agent
- [x] Canonical audit capsule builder
- [x] Local verification engine
- [x] Walrus upload/fetch for one JSON audit bundle
- [x] Sui/Tatum certificate with `capsule_hash` and `walrus_blob_id`
- [x] Public verify page
- [x] Tamper failure demo
- [x] Judge demo page with latest verified run and one-click tamper CTA
- [x] Cloudflare/Oxide-inspired landing + console UI
- [x] SQLite run storage
- [x] Project-scoped API keys in admin console
- [x] README
- [ ] Final 2–3 minute demo video URL
- [ ] Final submission copy

## Demo scoring priorities

1. Show Wallbox as agent accountability infrastructure, not storage.
2. Open `/demo` first so judges see the whole proof path in one screen.
3. Show Walrus blob ID.
4. Show Sui certificate object and tx digest through Tatum/Sui.
5. Show on-chain hash vs recomputed hash.
6. Click tamper CTA and show `TAMPERED`.
7. Keep video under 3 minutes.

## Recommended demo script

1. “Most AI agent projects focus on memory. Wallbox focuses on accountability.”
2. Open `/demo`.
3. Point to the selected verified run and explain it is a captured agent run.
4. Point to Walrus blob ID: full evidence bundle is stored on Walrus.
5. Point to Sui certificate/tx: capsule hash and blob ID are anchored through Tatum/Sui.
6. Point to hash comparison: recomputed hash matches on-chain hash.
7. Click `Simulate tampering`.
8. Show `TAMPERED`: changed evidence no longer matches the anchored hash.
9. Close with: “Wallbox does not prove the agent was correct. It proves the evidence was not changed after certification.”

## Fallback modes

- Full: real Walrus + real Sui/Tatum.
- Mode B: real Walrus + local/mock certificate.
- Mode C: local/mock Walrus + real Sui/Tatum.
- Last resort: fully local, clearly labeled.

Current production target should stay in full testnet mode unless secrets/network are unavailable:

```bash
WALLBOX_BLOB_STORE_MODE=walrus
WALLBOX_CERTIFICATE_MODE=sui-tatum
WALRUS_NETWORK=testnet
SUI_NETWORK=testnet
```

## Do not overclaim

Wallbox verifies evidence integrity. It does not prove the agent was correct, honest, unbiased, or complete.

Do not say:

- “Wallbox prevents all fraud.”
- “Wallbox proves the model answer is correct.”
- “Wallbox is generic file storage.”
- “Wallbox is just a logging dashboard.”

## Submission assets

- [ ] GitHub repo URL
- [x] Live URL: `https://wallbox.hanslabs.xyz`
- [x] Judge URL: `https://wallbox.hanslabs.xyz/demo`
- [ ] 2–3 minute video URL
- [ ] Short product description
- [ ] Mention Walrus, Sui, and Tatum explicitly
- [ ] Optional X/LinkedIn post tagging `@Tatum_io`, `@WalrusFoundation`, `@SuiNetwork`

## Short product description draft

Wallbox is a verifiable flight recorder for autonomous AI agents. It captures an agent run as a canonical audit capsule, stores the full evidence bundle on Walrus, anchors the capsule hash and blob ID on Sui through Tatum, and gives anyone a public verifier that detects post-run tampering.
