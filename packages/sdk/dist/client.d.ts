import type { CaptureRunInput, CaptureRunResponse, ListRunsResponse, RequestOptions, VerifyCertificateResponse, WallboxClientOptions, WallboxRun } from "./types.js";
export declare class WallboxError extends Error {
    readonly status: number;
    readonly body: unknown;
    constructor(message: string, status: number, body: unknown);
}
export declare class WallboxClient {
    private readonly baseUrl;
    private readonly apiKey?;
    private readonly fetchImpl;
    constructor(options: WallboxClientOptions);
    captureRun(input: CaptureRunInput, options?: RequestOptions): Promise<CaptureRunResponse>;
    verifyCertificate(certificateId: string): Promise<VerifyCertificateResponse>;
    getRun(runId: string): Promise<WallboxRun & Record<string, unknown>>;
    listRuns(limit?: number): Promise<ListRunsResponse>;
    private request;
}
