# Wallbox Hackathon Checklist

## Must ship

- Deterministic demo agent
- Canonical audit capsule builder
- Local verification engine
- Walrus upload/fetch for one JSON audit bundle
- Sui/Tatum certificate with `capsule_hash` and `walrus_blob_id`
- Public verify page
- Tamper failure demo
- Cloudflare-inspired landing page
- README + demo video

## Demo scoring priorities

1. Show Wallbox as agent accountability infrastructure, not storage.
2. Show Walrus blob ID.
3. Show Sui certificate/tx/object ID through Tatum.
4. Show on-chain hash vs recomputed hash.
5. Show tamper failure.
6. Keep video under 3 minutes.

## Fallback modes

- Full: real Walrus + real Sui/Tatum.
- Mode B: real Walrus + local/mock certificate.
- Mode C: local/mock Walrus + real Sui/Tatum.
- Last resort: fully local, clearly labeled.

## Do not overclaim

Wallbox verifies evidence integrity. It does not prove the agent was correct, honest, unbiased, or complete.

## Submission

- GitHub repo URL
- Live URL if available
- 2–3 minute video URL
- Short product description
- Mention Walrus, Sui, and Tatum explicitly
- Optional X/LinkedIn post tagging `@Tatum_io`, `@WalrusFoundation`, `@SuiNetwork`
