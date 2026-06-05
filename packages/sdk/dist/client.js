export class WallboxError extends Error {
    constructor(message, status, body) {
        super(message);
        this.name = "WallboxError";
        this.status = status;
        this.body = body;
    }
}
export class WallboxClient {
    constructor(options) {
        if (!options.baseUrl)
            throw new Error("WallboxClient requires baseUrl");
        this.baseUrl = options.baseUrl.replace(/\/+$/, "");
        this.apiKey = options.apiKey;
        this.fetchImpl = options.fetch ?? globalThis.fetch;
        if (!this.fetchImpl)
            throw new Error("WallboxClient requires fetch. Pass options.fetch in this runtime.");
    }
    async captureRun(input, options = {}) {
        const apiKey = options.apiKey ?? this.apiKey;
        if (!apiKey)
            throw new Error("captureRun requires apiKey");
        return this.request("/api/runs", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-wallbox-api-key": apiKey,
            },
            body: JSON.stringify({ mode: "external", ...input }),
        });
    }
    async verifyCertificate(certificateId) {
        return this.request(`/api/verify/${encodeURIComponent(certificateId)}`);
    }
    async getRun(runId) {
        return this.request(`/api/runs/${encodeURIComponent(runId)}`);
    }
    async listRuns(limit = 100, options = {}) {
        const params = new URLSearchParams({ limit: String(limit) });
        const apiKey = options.apiKey ?? this.apiKey;
        return this.request(`/api/runs?${params.toString()}`, {
            headers: apiKey ? { "x-wallbox-api-key": apiKey } : undefined,
        });
    }
    async request(path, init = {}) {
        const response = await this.fetchImpl(`${this.baseUrl}${path}`, init);
        const text = await response.text();
        const body = parseBody(text);
        if (!response.ok) {
            const message = errorMessage(body) || `Wallbox request failed with HTTP ${response.status}`;
            throw new WallboxError(message, response.status, body);
        }
        return body;
    }
}
function parseBody(text) {
    if (!text)
        return null;
    try {
        return JSON.parse(text);
    }
    catch {
        return text;
    }
}
function errorMessage(body) {
    if (body && typeof body === "object" && "error" in body && typeof body.error === "string")
        return body.error;
    return "";
}
//# sourceMappingURL=client.js.map