# Wallbox Demo Script

Target length: 2–3 minutes.

## 0:00–0:20 Problem

AI agents are becoming autonomous. They browse, trade, call tools, and make decisions. But when something goes wrong, there is no black box.

## 0:20–0:40 Product

Wallbox is a verifiable flight recorder for AI agents. It captures prompts, tool calls, sources, outputs, and artifacts into an audit capsule.

## 0:40–1:15 Run demo

Run the demo risk agent. It analyzes whether an AI trading agent should be trusted with user funds. Wallbox records each step and builds an audit capsule.

## 1:15–1:45 Evidence storage + certificate

Wallbox stores the capsule through a Walrus-compatible adapter and anchors a certificate containing the evidence blob ID and capsule hash. In the current public VPS demo, the UI labels this as local fallback mode. With Walrus/Tatum credentials, the same flow switches to live Walrus and Sui/Tatum mode through environment variables.

## 1:45–2:20 Verify

Open the verification page. Wallbox reads the certificate, fetches the evidence capsule, recomputes the hash, and proves whether the evidence is intact. The important part is independent hash recomputation: integrity verified, not truth verified.

## 2:20–2:45 Tamper proof

Click `Simulate tampering`. Wallbox modifies only a local cached evidence clone, then verifies that altered capsule against the original certificate hash. Verification fails because the recomputed hash no longer matches.

## 2:45–3:00 Close

Wallbox is the black box layer for agentic systems: evidence on Walrus, certificates on Sui through Tatum, with local fallback available for deterministic demos.
