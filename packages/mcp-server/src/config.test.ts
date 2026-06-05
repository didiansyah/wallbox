import { describe, expect, it } from "vitest";
import { asJsonText, loadConfig, redactConfig } from "./config";

describe("Wallbox MCP config", () => {
  it("loads base URL and API key from environment", () => {
    expect(loadConfig({ WALLBOX_BASE_URL: "https://wallbox.test", WALLBOX_API_KEY: "wbx_secret" })).toEqual({
      baseUrl: "https://wallbox.test",
      apiKey: "wbx_secret",
    });
  });

  it("redacts API keys in status output", () => {
    expect(redactConfig({ baseUrl: "https://wallbox.test", apiKey: "wbx_secret" })).toEqual({
      baseUrl: "https://wallbox.test",
      apiKeyConfigured: true,
    });
  });

  it("formats MCP text responses as JSON", () => {
    expect(asJsonText({ ok: true }).content[0].text).toBe(JSON.stringify({ ok: true }, null, 2));
  });
});
