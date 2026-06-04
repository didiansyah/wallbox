# Wallbox Architecture

## Overview

Wallbox packages AI agent runs into verifiable audit capsules.

## Components

- Frontend dashboard: run demo agent, inspect capsule, verify certificate.
- Capsule engine: canonical hashing, schema validation, tamper detection.
- Demo agent: deterministic sample agent for reliable hackathon demo.
- Walrus client: uploads and fetches audit capsules.
- Tatum/Sui client: creates and reads Sui-side certificates.

## Data flow

1. User starts agent run.
2. Demo agent produces trace, sources, verdict, and final artifact.
3. Capsule builder creates canonical capsule and `capsule_hash`.
4. Walrus client uploads capsule and returns `walrus_blob_id`.
5. Tatum/Sui client creates certificate containing `capsule_hash` and `walrus_blob_id`.
6. Verify page fetches certificate, fetches capsule, recomputes hash, and compares.

## Verification states

- `VERIFIED`: Walrus capsule hash matches Sui certificate hash.
- `TAMPERED`: recomputed hash differs.
- `MISSING_BLOB`: Walrus blob cannot be fetched.
- `INVALID_SCHEMA`: capsule does not match Wallbox schema.
- `CERTIFICATE_NOT_FOUND`: Sui certificate cannot be read.
