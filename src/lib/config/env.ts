export type BlobStoreMode = "walrus" | "local";
export type CertificateMode = "sui-tatum" | "local";
export function blobStoreMode(): BlobStoreMode { return (process.env.WALLBOX_BLOB_STORE_MODE === "walrus" ? "walrus" : "local"); }
export function certificateMode(): CertificateMode { return (process.env.WALLBOX_CERTIFICATE_MODE === "sui-tatum" ? "sui-tatum" : "local"); }
export function publicAppUrl() { return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3070"; }

export function isMainnetDisabled(network?: string) {
  return network === "mainnet" && process.env.WALLBOX_ALLOW_MAINNET !== "true";
}

export function assertTestnetFirst(network: string | undefined, integration: "Walrus" | "Sui/Tatum") {
  if (isMainnetDisabled(network)) {
    throw new Error(`${integration} mainnet is disabled by default. Set WALLBOX_ALLOW_MAINNET=true only after mainnet funds and operations are ready; use testnet for now.`);
  }
}
