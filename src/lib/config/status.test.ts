import { describe, expect, it, vi } from "vitest";
import { integrationStatus } from "./status";

function withEnv(env: Record<string, string | undefined>, fn: () => void) {
  const original = { ...process.env };
  vi.stubEnv("WALLBOX_BLOB_STORE_MODE", env.WALLBOX_BLOB_STORE_MODE);
  vi.stubEnv("WALLBOX_CERTIFICATE_MODE", env.WALLBOX_CERTIFICATE_MODE);
  vi.stubEnv("WALRUS_PUBLISHER_URL", env.WALRUS_PUBLISHER_URL);
  vi.stubEnv("WALRUS_AGGREGATOR_URL", env.WALRUS_AGGREGATOR_URL);
  vi.stubEnv("TATUM_API_KEY", env.TATUM_API_KEY);
  vi.stubEnv("TATUM_SUI_RPC_URL", env.TATUM_SUI_RPC_URL);
  vi.stubEnv("SUI_PRIVATE_KEY", env.SUI_PRIVATE_KEY);
  vi.stubEnv("SUI_PACKAGE_ID", env.SUI_PACKAGE_ID);
  try {
    fn();
  } finally {
    vi.unstubAllEnvs();
    process.env = original;
  }
}

describe("integrationStatus", () => {
  it("labels default deployment as local fallback", () => {
    withEnv({ WALLBOX_BLOB_STORE_MODE: "local", WALLBOX_CERTIFICATE_MODE: "local" }, () => {
      const status = integrationStatus();
      expect(status.blob).toMatchObject({ mode: "local", ready: true });
      expect(status.certificate).toMatchObject({ mode: "local", ready: true });
      expect(status.warnings).toContain("Blob storage is running in local fallback mode, not live Walrus.");
    });
  });

  it("reports missing live integration variables", () => {
    withEnv({ WALLBOX_BLOB_STORE_MODE: "walrus", WALLBOX_CERTIFICATE_MODE: "sui-tatum" }, () => {
      const status = integrationStatus();
      expect(status.blob.ready).toBe(false);
      expect(status.blob.missing).toEqual(["WALRUS_PUBLISHER_URL", "WALRUS_AGGREGATOR_URL"]);
      expect(status.certificate.ready).toBe(false);
      expect(status.certificate.missing).toEqual(["TATUM_API_KEY", "TATUM_SUI_RPC_URL", "SUI_PRIVATE_KEY", "SUI_PACKAGE_ID"]);
    });
  });
});
