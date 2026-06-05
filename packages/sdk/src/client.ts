import type {
  CaptureRunInput,
  CaptureRunResponse,
  ListRunsResponse,
  RequestOptions,
  VerifyCertificateResponse,
  WallboxClientOptions,
  WallboxRun,
} from "./types.js";

export class WallboxError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "WallboxError";
    this.status = status;
    this.body = body;
  }
}

export class WallboxClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: WallboxClientOptions) {
    if (!options.baseUrl) throw new Error("WallboxClient requires baseUrl");
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.apiKey = options.apiKey;
    this.fetchImpl = options.fetch ?? globalThis.fetch;
    if (!this.fetchImpl) throw new Error("WallboxClient requires fetch. Pass options.fetch in this runtime.");
  }

  async captureRun(input: CaptureRunInput, options: RequestOptions = {}): Promise<CaptureRunResponse> {
    const apiKey = options.apiKey ?? this.apiKey;
    if (!apiKey) throw new Error("captureRun requires apiKey");

    return this.request<CaptureRunResponse>("/api/runs", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-wallbox-api-key": apiKey,
      },
      body: JSON.stringify({ mode: "external", ...input }),
    });
  }

  async verifyCertificate(certificateId: string): Promise<VerifyCertificateResponse> {
    return this.request<VerifyCertificateResponse>(`/api/verify/${encodeURIComponent(certificateId)}`);
  }

  async getRun(runId: string): Promise<WallboxRun & Record<string, unknown>> {
    return this.request<WallboxRun & Record<string, unknown>>(`/api/runs/${encodeURIComponent(runId)}`);
  }

  async listRuns(limit = 100): Promise<ListRunsResponse> {
    const params = new URLSearchParams({ limit: String(limit) });
    return this.request<ListRunsResponse>(`/api/runs?${params.toString()}`);
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, init);
    const text = await response.text();
    const body = parseBody(text);

    if (!response.ok) {
      const message = errorMessage(body) || `Wallbox request failed with HTTP ${response.status}`;
      throw new WallboxError(message, response.status, body);
    }

    return body as T;
  }
}

function parseBody(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorMessage(body: unknown) {
  if (body && typeof body === "object" && "error" in body && typeof body.error === "string") return body.error;
  return "";
}
