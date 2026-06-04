import { describe, expect, it } from "vitest";
import { parseSuiCertificateObject } from "./certificate";

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
});
