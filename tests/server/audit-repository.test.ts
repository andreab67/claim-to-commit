import { describe, expect, it } from "vitest";

import { auditRepository } from "../../src/server/audit/audit-repository.js";
import type { ClaimAudit } from "../../src/shared/evidence.js";

function claim(
  id: string,
  importance: ClaimAudit["importance"],
  status: ClaimAudit["status"],
): ClaimAudit {
  return {
    id,
    title: id,
    description: id,
    importance,
    userVisible: false,
    status,
    evidence: [],
    findings: [],
  };
}

describe("auditRepository", () => {
  it("weights proven claims by importance and exposes the formula", () => {
    const result = auditRepository({
      scanId: "scan-1",
      scannedAt: "2026-07-18T23:00:00.000Z",
      source: "live",
      project: { name: "Fixture", description: "Fixture repository" },
      repository: {
        displayPath: "fixture",
        branch: "main",
        revision: "abc1234",
      },
      claims: [
        claim("headline", "headline", "proven"),
        claim("major", "major", "partial"),
        claim("supporting", "supporting", "proven"),
      ],
    });

    expect(result.score).toBe(67);
    expect(result.counts).toEqual({ proven: 2, partial: 1, unsupported: 0 });
    expect(result.formula).toContain("4 proven weight ÷ 6 total weight");
  });

  it("excludes a declared audit control from shipped-claim coverage", () => {
    const control = {
      ...claim("unsupported-control", "supporting", "unsupported"),
      scoring: "excluded-control",
    } as ClaimAudit;

    const result = auditRepository({
      scanId: "scan-control",
      scannedAt: "2026-07-19T02:00:00.000Z",
      source: "live",
      project: { name: "Fixture", description: "Fixture repository" },
      repository: {
        displayPath: "fixture",
        branch: "main",
        revision: "abc1234",
      },
      claims: [claim("shipped-headline", "headline", "proven"), control],
    });

    expect(result.score).toBe(100);
    expect(result.formula).toBe(
      "3 proven weight ÷ 3 scored weight × 100 · 1 audit control excluded",
    );
    expect(result.counts).toEqual({ proven: 1, partial: 0, unsupported: 1 });
  });
});
