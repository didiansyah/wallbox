# Wallbox Demo Script

Target length: 2–3 minutes.

## 0:00–0:20 Problem

AI agents are becoming autonomous. They browse, trade, call tools, and make decisions. But when something goes wrong, there is no black box.

## 0:20–0:40 Product

Wallbox is a verifiable flight recorder for AI agents. It captures prompts, tool calls, sources, outputs, and artifacts into an audit capsule.

## 0:40–1:15 Run demo

Run the demo risk agent. It analyzes whether an AI trading agent should be trusted with user funds. Wallbox records each step and builds an audit capsule.

## 1:15–1:45 Walrus + Sui

The capsule is uploaded to Walrus. Then Wallbox creates a Sui certificate through Tatum RPC containing the Walrus blob ID and capsule hash.

## 1:45–2:20 Verify

Open the verification page. Wallbox reads the Sui certificate, fetches the Walrus capsule, recomputes the hash, and proves whether the evidence is intact.

## 2:20–2:45 Tamper proof

Modify the local capsule preview or use the demo tamper route. Verification fails because the recomputed hash no longer matches the Sui certificate.

## 2:45–3:00 Close

Wallbox is the black box layer for agentic systems, powered by Walrus, Sui, and Tatum.
