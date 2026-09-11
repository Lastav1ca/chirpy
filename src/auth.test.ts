import { describe, it, expect, beforeAll } from "vitest";
import { makeJWT, validateJWT } from "./auth.js";

describe("JWT", () => {
    it("validira ispravan token i vraca userID", () => {
        const token = makeJWT("123", 100000, "test-secret");
        expect(validateJWT(token, "test-secret")).toBe("123");
    });

    it("prepoznaje da je token neispravan i baca error", () => {
        const token = makeJWT("123", 100000, "test-secret");
        expect(() => validateJWT(token, "not-test-secret")).toThrow();
    });

    it("proverava ispravnost isteka tokena", () => {
        const token = makeJWT("123", -10, "test-secret");
        expect(() => validateJWT(token, "test-secret")).toThrow();
    });
});
