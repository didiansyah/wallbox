import { afterEach, describe, expect, it } from "vitest";
import { configuredAdminKeys, isWallboxAdminAuthorized, wallboxAdminConfigured } from "@/lib/config/admin-auth";

const original = {
  adminKey: process.env.WALLBOX_ADMIN_KEY,
  adminKeys: process.env.WALLBOX_ADMIN_KEYS,
  apiKey: process.env.WALLBOX_API_KEY,
  apiKeys: process.env.WALLBOX_API_KEYS,
};

afterEach(() => {
  if (original.adminKey === undefined) delete process.env.WALLBOX_ADMIN_KEY; else process.env.WALLBOX_ADMIN_KEY = original.adminKey;
  if (original.adminKeys === undefined) delete process.env.WALLBOX_ADMIN_KEYS; else process.env.WALLBOX_ADMIN_KEYS = original.adminKeys;
  if (original.apiKey === undefined) delete process.env.WALLBOX_API_KEY; else process.env.WALLBOX_API_KEY = original.apiKey;
  if (original.apiKeys === undefined) delete process.env.WALLBOX_API_KEYS; else process.env.WALLBOX_API_KEYS = original.apiKeys;
});

describe("Wallbox admin auth", () => {
  it("accepts admin key and comma-separated rotations", () => {
    process.env.WALLBOX_ADMIN_KEY = "admin_one";
    process.env.WALLBOX_ADMIN_KEYS = "admin_two,admin_three";

    expect(configuredAdminKeys()).toEqual(["admin_one", "admin_two", "admin_three"]);
    expect(wallboxAdminConfigured()).toBe(true);
    expect(isWallboxAdminAuthorized("admin_three")).toBe(true);
    expect(isWallboxAdminAuthorized("wrong")).toBe(false);
  });

  it("falls back to capture API key only when no admin key exists", () => {
    delete process.env.WALLBOX_ADMIN_KEY;
    delete process.env.WALLBOX_ADMIN_KEYS;
    process.env.WALLBOX_API_KEY = "wbx_capture";

    expect(wallboxAdminConfigured()).toBe(true);
    expect(isWallboxAdminAuthorized("wbx_capture")).toBe(true);
  });

  it("does not accept capture key when admin key is configured", () => {
    process.env.WALLBOX_ADMIN_KEY = "admin_only";
    process.env.WALLBOX_API_KEY = "wbx_capture";

    expect(isWallboxAdminAuthorized("wbx_capture")).toBe(false);
    expect(isWallboxAdminAuthorized("admin_only")).toBe(true);
  });
});
