import { describe, expect, it } from "vitest";
import { sha256CanonicalJson } from "./hash";

describe("canonical hashing", () => {
  it("hashes objects independently of key order", () => {
    expect(sha256CanonicalJson({ b: 2, a: { d: 4, c: 3 } })).toBe(sha256CanonicalJson({ a: { c: 3, d: 4 }, b: 2 }));
  });
  it("changes when artifact content changes", () => {
    expect(sha256CanonicalJson({ artifact: "alpha" })).not.toBe(sha256CanonicalJson({ artifact: "beta" }));
  });
});
