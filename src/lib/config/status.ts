import { blobStoreMode, certificateMode } from "@/lib/config/env";

export type IntegrationStatus = {
  appUrl: string;
  blob: {
    mode: "walrus" | "local";
    network: string;
    ready: boolean;
    missing: string[];
  };
  certificate: {
    mode: "sui-tatum" | "local";
    network: string;
    ready: boolean;
    missing: string[];
    tatumRpcConfigured: boolean;
    signerConfigured: boolean;
    packageConfigured: boolean;
    movePackagePresent: boolean;
  };
  warnings: string[];
};

function missing(names: string[]) {
  return names.filter((name) => !process.env[name]);
}

export function integrationStatus(): IntegrationStatus {
  const blobMode = blobStoreMode();
  const certMode = certificateMode();
  const blobMissing = blobMode === "walrus" ? missing(["WALRUS_PUBLISHER_URL", "WALRUS_AGGREGATOR_URL"]) : [];
  const certMissing =
    certMode === "sui-tatum"
      ? missing(["TATUM_API_KEY", "TATUM_SUI_RPC_URL", "SUI_PRIVATE_KEY", "SUI_PACKAGE_ID"])
      : [];
  const tatumRpcConfigured = missing(["TATUM_API_KEY", "TATUM_SUI_RPC_URL"]).length === 0;
  const signerConfigured = missing(["SUI_PRIVATE_KEY"]).length === 0;
  const packageConfigured = missing(["SUI_PACKAGE_ID"]).length === 0;

  const warnings: string[] = [];
  if (blobMode === "local") warnings.push("Blob storage is running in local fallback mode, not live Walrus.");
  if (certMode === "local") warnings.push("Certificate anchoring is running in local fallback mode, not live Sui/Tatum.");
  if (blobMissing.length) warnings.push(`Walrus mode is selected but missing: ${blobMissing.join(", ")}.`);
  if (certMissing.length) warnings.push(`Sui/Tatum mode is selected but missing: ${certMissing.join(", ")}.`);

  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3070",
    blob: {
      mode: blobMode,
      network: process.env.WALRUS_NETWORK || (blobMode === "local" ? "local-demo" : "testnet"),
      ready: blobMissing.length === 0,
      missing: blobMissing,
    },
    certificate: {
      mode: certMode,
      network: process.env.SUI_NETWORK || (certMode === "local" ? "local-demo" : "testnet"),
      ready: certMissing.length === 0,
      missing: certMissing,
      tatumRpcConfigured,
      signerConfigured,
      packageConfigured,
      movePackagePresent: true,
    },
    warnings,
  };
}
