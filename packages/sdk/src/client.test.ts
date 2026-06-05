import { describe, expect, it } from "vitest";
import { WallboxClient, WallboxError } from "./client";

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), { status: 200, ...init, headers: { "content-type": "application/json", ...init.headers } });
}

describe("WallboxClient", () => {
  it("captures external runs with API key auth", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const client = new WallboxClient({
      baseUrl: "https://wallbox.test/",
      apiKey: "wbx_test",
      fetch: (async (url, init) => {
        calls.push({ url: String(url), init });
        return jsonResponse({ run_id: "run_1", status: "completed", verify_url: "/verify/0x1" });
      }) as typeof fetch,
    });

    const result = await client.captureRun({
      task: "Audit decision",
      agent: { id: "agent", name: "Agent" },
      trace: [{ id: "step_1", type: "decision", name: "final", startedAt: "2026-06-05T00:00:00.000Z", summary: "Done." }],
    });

    expect(result.run_id).toBe("run_1");
    expect(calls[0].url).toBe("https://wallbox.test/api/runs");
    expect((calls[0].init?.headers as Record<string, string>)["x-wallbox-api-key"]).toBe("wbx_test");
    expect(JSON.parse(String(calls[0].init?.body))).toMatchObject({ mode: "external", task: "Audit decision" });
  });

  it("verifies certificate IDs", async () => {
    const client = new WallboxClient({
      baseUrl: "https://wallbox.test",
      fetch: (async (url) => {
        expect(String(url)).toBe("https://wallbox.test/api/verify/0xabc");
        return jsonResponse({ status: "VERIFIED", certificate_id: "0xabc" });
      }) as typeof fetch,
    });

    await expect(client.verifyCertificate("0xabc")).resolves.toMatchObject({ status: "VERIFIED" });
  });

  it("raises WallboxError on failed responses", async () => {
    const client = new WallboxClient({
      baseUrl: "https://wallbox.test",
      apiKey: "bad",
      fetch: (async () => jsonResponse({ error: "Invalid key" }, { status: 401 })) as typeof fetch,
    });

    await expect(client.captureRun({ task: "x", agent: { id: "a", name: "A" }, trace: [] })).rejects.toMatchObject({
      name: "WallboxError",
      status: 401,
      message: "Invalid key",
    } satisfies Partial<WallboxError>);
  });
});
