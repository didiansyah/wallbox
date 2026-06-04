export type BlobStoreMode = "walrus" | "local";
export type CertificateMode = "sui-tatum" | "local";
export function blobStoreMode(): BlobStoreMode { return (process.env.WALLBOX_BLOB_STORE_MODE === "walrus" ? "walrus" : "local"); }
export function certificateMode(): CertificateMode { return (process.env.WALLBOX_CERTIFICATE_MODE === "sui-tatum" ? "sui-tatum" : "local"); }
export function publicAppUrl() { return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3070"; }
