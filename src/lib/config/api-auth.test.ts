import { afterEach, describe, expect, it } from "vitest";
import { externalApiAuthErrorMessage, isWallboxApiAuthorized, wallboxApiAuthConfigured, wallboxApiKeys, wallboxAuthContext, wallboxProjectCount, wallboxProjectKeys } from "@/lib/config/api-auth";

function req(headers: Record<string, string> = {}) {
  return { headers: new Headers(headers) } as Pick<Request, "headers">;
}

const original = {
  nodeEnv: process.env.NODE_ENV,
  key: process.env.WALLBOX_API_KEY,
  keys: process.env.WALLBOX_API_KEYS,
};

afterEach(() => {
  process.env.NODE_ENV = original.nodeEnv;
  if (original.key === undefined) delete process.env.WALLBOX_API_KEY; else process.env.WALLBOX_API_KEY = original.key;
  if (original.keys === undefined) delete process.env.WALLBOX_API_KEYS; else process.env.WALLBOX_API_KEYS = original.keys;
});

describe("Wallbox API auth", () => {
  it("accepts configured x-wallbox-api-key tokens", () => {
    process.env.WALLBOX_API_KEY = "wbx_secret";
    delete process.env.WALLBOX_API_KEYS;

    expect(wallboxApiKeys()).toEqual(["wbx_secret"]);
    expect(wallboxApiAuthConfigured()).toBe(true);
    expect(isWallboxApiAuthorized(req({ "x-wallbox-api-key": "wbx_secret" }))).toBe(true);
    expect(isWallboxApiAuthorized(req({ "x-wallbox-api-key": "wrong" }))).toBe(false);
  });

  it("accepts bearer tokens and comma-separated key rotation", () => {
    delete process.env.WALLBOX_API_KEY;
    process.env.WALLBOX_API_KEYS = "old_key, new_key";

    expect(wallboxApiKeys()).toEqual(["old_key", "new_key"]);
    expect(isWallboxApiAuthorized(req({ authorization: "Bearer new_key" }))).toBe(true);
  });

  it("maps API keys to projects", () => {
    delete process.env.WALLBOX_API_KEY;
    process.env.WALLBOX_API_KEYS = "agenthub=wbx_agenthub, meridian|Meridian Bot|wbx_meridian";

    expect(wallboxProjectKeys()).toMatchObject([
      { projectId: "agenthub", projectName: "Agenthub", key: "wbx_agenthub" },
      { projectId: "meridian", projectName: "Meridian Bot", key: "wbx_meridian" },
    ]);
    expect(wallboxProjectCount()).toBe(2);
    expect(wallboxAuthContext(req({ "x-wallbox-api-key": "wbx_meridian" }))).toMatchObject({
      projectId: "meridian",
      projectName: "Meridian Bot",
    });
  });

  it("allows missing keys only outside production", () => {
    delete process.env.WALLBOX_API_KEY;
    delete process.env.WALLBOX_API_KEYS;

    process.env.NODE_ENV = "development";
    expect(isWallboxApiAuthorized(req())).toBe(true);

    process.env.NODE_ENV = "production";
    expect(isWallboxApiAuthorized(req())).toBe(false);
    expect(externalApiAuthErrorMessage()).toContain("WALLBOX_API_KEY");
  });
});
