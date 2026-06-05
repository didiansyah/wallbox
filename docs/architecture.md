# Wallbox Architecture

## Overview

Wallbox packages AI agent runs into verifiable audit capsules. The app is built around swappable storage and certificate adapters so the same demo path can run in fully local mode or live Walrus + Sui/Tatum mode.

## Components

- Frontend dashboard: run demo agent, inspect capsule, verify certificate.
- Capsule engine: canonical hashing, schema validation, tamper detection.
- Demo agent: deterministic sample agent for reliable hackathon demo.
- Walrus client: uploads/fetches audit capsules in `walrus` mode; local fallback stores the same JSON bundle shape.
- Tatum/Sui client: reads Sui certificate objects through Tatum RPC and parses Wallbox fields; local fallback stores the same certificate shape.
- Move package: `move/wallbox` defines the intended `AgentRunCertificate` object and `CertificateCreated` event.

## Data flow

1. User starts agent run.
2. Demo agent produces trace, sources, verdict, and final artifact.
3. Capsule builder creates canonical capsule and `capsule_hash`.
4. Blob adapter stores the capsule and returns `walrus_blob_id` or a local fallback blob ID.
5. Certificate adapter anchors `capsule_hash` and blob ID as either a Sui/Tatum certificate or local fallback certificate.
6. Verify page fetches certificate, fetches capsule, recomputes hash, and compares.

## Modes

- Full integration: `WALLBOX_BLOB_STORE_MODE=walrus` + `WALLBOX_CERTIFICATE_MODE=sui-tatum`.
- Mode B: real Walrus + local certificate fallback.
- Mode C: local blob fallback + real Sui/Tatum certificate.
- Current deployed demo: real Walrus testnet blob storage + real Sui/Tatum testnet certificate anchoring.

## Verification states

- `VERIFIED`: fetched capsule hash matches the anchored certificate hash.
- `TAMPERED`: recomputed hash differs.
- `MISSING_BLOB`: evidence blob cannot be fetched.
- `INVALID_SCHEMA`: capsule does not match Wallbox schema.
- `CERTIFICATE_NOT_FOUND`: certificate cannot be read.

## Tatum/Sui status

`src/lib/sui/certificate.ts` includes a real Sui object parser for Tatum `sui_getObject` responses. Certificate creation calls the deployed `move/wallbox` package on Sui testnet through the Sui CLI signer and checks Tatum RPC readiness before writing.
