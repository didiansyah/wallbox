import { describe, expect, it } from "vitest";
import { parseSuiCertificateObject, parseSuiCreateCertificateResult } from "./certificate";

describe("parseSuiCertificateObject", () => {
  it("extracts Wallbox fields from a Sui getObject content response", () => {
    const cert = parseSuiCertificateObject(
      {
        data: {
          objectId: "0xcert",
          content: {
            dataType: "moveObject",
            type: "0xpackage::certificate::AgentRunCertificate",
            fields: {
              id: { id: "0xcert" },
              run_id: "run_20260604_001",
              agent_id: "risklens-demo-agent",
              capsule_hash: "0xabc123",
              walrus_blob_id: "walrus_blob_123",
              schema_version: "wallbox.audit_capsule.v1",
              created_at_ms: "1790000000000",
            },
          },
        },
      },
      "0xfallback",
    );

    expect(cert).toMatchObject({
      certificateId: "0xcert",
      txDigest: "0xcert",
      runId: "run_20260604_001",
      agentId: "risklens-demo-agent",
      capsuleHash: "0xabc123",
      walrusBlobId: "walrus_blob_123",
      schemaVersion: "wallbox.audit_capsule.v1",
      createdAtMs: 1790000000000,
      mode: "sui-tatum",
    });
  });

  it("fails clearly when required certificate fields are missing", () => {
    expect(() =>
      parseSuiCertificateObject({ data: { content: { fields: { id: { id: "0xcert" } } } } }, "0xcert"),
    ).toThrow(/missing run_id, agent_id, capsule_hash, walrus_blob_id/);
  });

  it("extracts certificate object ID and event fields from Sui CLI call output", () => {
    const cert = parseSuiCreateCertificateResult(
      {
        digest: "tx_digest",
        effects: { status: { status: "success" } },
        objectChanges: [
          {
            type: "created",
            objectType: "0xpackage::certificate::AgentRunCertificate",
            objectId: "0xcert_object",
          },
        ],
        events: [
          {
            parsedJson: {
              certificate_id: "0xcert_object",
              run_id: "run_live_001",
              agent_id: "risklens-demo-agent",
              capsule_hash: "0xhash",
              walrus_blob_id: "local-walrus-blob",
              schema_version: "wallbox.audit_capsule.v1",
              created_at_ms: "1790000000000",
            },
          },
        ],
      },
      {
        runId: "fallback_run",
        agentId: "fallback_agent",
        capsuleHash: "0xfallback",
        walrusBlobId: "fallback_blob",
        schemaVersion: "wallbox.audit_capsule.v1",
      },
    );

    expect(cert).toMatchObject({
      certificateId: "0xcert_object",
      txDigest: "tx_digest",
      runId: "run_live_001",
      capsuleHash: "0xhash",
      mode: "sui-tatum",
    });
  });
});
