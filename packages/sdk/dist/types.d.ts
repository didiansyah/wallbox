export type WallboxTraceType = "tool_call" | "model_step" | "decision" | "error";
export type WallboxRiskLevel = "low" | "medium" | "high";
export type WallboxAgent = {
    id: string;
    name: string;
    version?: string;
};
export type WallboxModel = {
    provider: string;
    name: string;
    version?: string;
};
export type WallboxPolicy = {
    version?: string;
    system_prompt?: string;
    system_prompt_sha256?: string;
};
export type WallboxTraceEntry = {
    id: string;
    type: WallboxTraceType;
    name: string;
    inputHash?: string;
    outputHash?: string;
    startedAt: string;
    completedAt?: string;
    summary: string;
};
export type WallboxSourceRecord = {
    id: string;
    type: "url" | "file" | "api" | "chain_object";
    label: string;
    uri: string;
    sha256?: string;
    accessedAt: string;
};
export type WallboxVerdict = {
    verdict: string;
    riskLevel: WallboxRiskLevel;
    summary: string;
    requiredControls: string[];
};
export type CaptureRunInput = {
    run_id?: string;
    task: string;
    started_at?: string;
    completed_at?: string;
    agent: WallboxAgent;
    model?: WallboxModel;
    policy?: WallboxPolicy;
    trace: WallboxTraceEntry[];
    sources?: WallboxSourceRecord[];
    verdict?: WallboxVerdict;
    artifacts?: Record<string, string>;
};
export type CaptureRunResponse = {
    run_id: string;
    status: "completed" | string;
    capsule_hash: string;
    walrus_blob_id: string;
    sui_certificate_id: string;
    sui_tx_digest: string;
    blob_mode: "walrus" | "local" | string;
    certificate_mode: "sui-tatum" | "local" | string;
    integration_mode: "external" | "demo" | string;
    project_id?: string;
    project_name?: string;
    verify_url: string;
    capsule_url: string;
};
export type WallboxRun = {
    runId: string;
    status: string;
    task: string;
    taskHash: string;
    agentId: string;
    agentName: string;
    projectId?: string;
    projectName?: string;
    capsuleHash?: string;
    walrusBlobId?: string;
    suiCertificateId?: string;
    suiTxDigest?: string;
    blobMode?: string;
    certificateMode?: string;
    createdAt: string;
    updatedAt: string;
    error?: string;
};
export type ListRunsResponse = {
    runs: WallboxRun[];
    count: number;
    project_id?: string;
};
export type VerifyCertificateResponse = {
    status: "VERIFIED" | "TAMPERED" | "INVALID_SCHEMA" | "MISSING_BLOB" | "CERTIFICATE_NOT_FOUND" | string;
    certificate_id: string;
    sui_certificate_id?: string;
    sui_tx_digest?: string;
    walrus_blob_id?: string;
    onchain_capsule_hash?: string;
    recomputed_capsule_hash?: string;
    files?: Array<{
        path: string;
        status: "OK" | "MISSING" | "MISMATCH" | "EXTRA" | string;
        sha256?: string;
        expectedSha256?: string;
    }>;
    error?: string;
};
export type WallboxClientOptions = {
    baseUrl: string;
    apiKey?: string;
    fetch?: typeof fetch;
};
export type RequestOptions = {
    apiKey?: string;
};
