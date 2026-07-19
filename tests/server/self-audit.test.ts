import { describe, expect, it } from "vitest";

import { scanRepository } from "../../src/server/scan/scan-repository.js";
import { createScanStore } from "../../src/server/store/scan-store.js";

describe("live Claim to Commit self-audit", () => {
  it("proves the completed visual chain while preserving the honest unsupported claim", async () => {
    const store = createScanStore(":memory:");

    try {
      const audit = await scanRepository(process.cwd(), store);
      const visualClaim = audit.claims.find(
        (claim) => claim.id === "visual-workbench",
      );
      const unsupportedClaim = audit.claims.find(
        (claim) => claim.id === "semantic-inference",
      );

      expect(audit.score).toBe(90);
      expect(visualClaim).toMatchObject({ status: "proven", findings: [] });
      expect(visualClaim?.evidence).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "commit",
            resolution: "resolved",
            metadata: expect.objectContaining({
              sha: "967d962ec92f85d922a00b6f1238aee07d1a0f0a",
            }),
          }),
          expect.objectContaining({ type: "test", resolution: "resolved" }),
          expect.objectContaining({
            type: "screenshot",
            resolution: "resolved",
          }),
        ]),
      );
      expect(unsupportedClaim).toMatchObject({
        status: "unsupported",
        findings: expect.arrayContaining([
          expect.objectContaining({ code: "IMPLEMENTATION_UNPROVEN" }),
        ]),
      });
    } finally {
      store.close();
    }
  });
});
