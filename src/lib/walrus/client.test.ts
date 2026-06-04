import { describe, expect, it } from "vitest";
import { parseWalrusUploadResponse } from "./client";

describe("parseWalrusUploadResponse", () => {
  it.each([
    [{ blobId: "direct" }, "direct"],
    [{ blob_id: "direct_snake" }, "direct_snake"],
    [{ newlyCreated: { blobObject: { blobId: "new_blob" } } }, "new_blob"],
    [{ newlyCreated: { blobObject: { blob_id: "new_blob_snake" } } }, "new_blob_snake"],
    [{ alreadyCertified: { blobId: "certified" } }, "certified"],
    [{ alreadyCertified: { event: { blobId: "event_blob" } } }, "event_blob"],
  ])("extracts blob id from Walrus response variant %#", (response, expected) => {
    expect(parseWalrusUploadResponse(response, "fallback")).toBe(expected);
  });

  it("uses fallback when Walrus response has no recognized blob id", () => {
    expect(parseWalrusUploadResponse({ unexpected: true }, "fallback_blob")).toBe("fallback_blob");
  });
});
