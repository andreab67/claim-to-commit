import { describe, expect, it } from "vitest";

import { parseEvidenceManifest } from "../../src/shared/schema.js";

const validManifest = {
  schemaVersion: 1,
  project: {
    name: "Fixture project",
    description: "A repository used to prove the evidence contract.",
  },
  sessions: [
    {
      id: "session-core",
      label: "Core build checkpoint",
      summary: "Codex implemented the deterministic audit engine.",
      reference: "session://build-week/core",
    },
  ],
  tests: [
    {
      id: "test-audit",
      command: "npm run test:run -- audit-claim.test.ts",
      resultPath: "artifacts/test-results.json",
    },
  ],
  claims: [
    {
      id: "claim-audit",
      title: "Audits product claims",
      description: "Links a product claim to inspectable repository evidence.",
      importance: "headline",
      userVisible: true,
      evidence: [
        {
          id: "decision-explicit",
          type: "decision",
          decisionId: "DEC-001",
          label: "Explicit evidence contract",
        },
        {
          id: "session-core-ref",
          type: "session",
          sessionId: "session-core",
          label: "Core build session",
        },
        {
          id: "commit-core",
          type: "commit",
          sha: "0123456789abcdef0123456789abcdef01234567",
          label: "Evidence engine commit",
        },
        {
          id: "file-audit",
          type: "file",
          path: "src/server/audit/audit-claim.ts",
          commit: "0123456789abcdef0123456789abcdef01234567",
          label: "Audit implementation",
        },
        {
          id: "test-audit-ref",
          type: "test",
          testId: "test-audit",
          label: "Audit rule tests",
        },
        {
          id: "screenshot-audit",
          type: "screenshot",
          path: "docs/screenshots/claim-audit.png",
          label: "Audit Mode screenshot",
          caption: "Audit Mode exposes an unsupported claim.",
        },
      ],
    },
  ],
} as const;

describe("parseEvidenceManifest", () => {
  it("accepts all supported evidence types", () => {
    const result = parseEvidenceManifest(validManifest);

    expect(result.schemaVersion).toBe(1);
    expect(result.claims[0]?.evidence.map((item) => item.type)).toEqual([
      "decision",
      "session",
      "commit",
      "file",
      "test",
      "screenshot",
    ]);
  });

  it("preserves an explicitly excluded audit control", () => {
    const result = parseEvidenceManifest({
      ...validManifest,
      claims: [
        {
          ...validManifest.claims[0],
          scoring: "excluded-control",
        },
      ],
    });

    expect(result.claims[0]?.scoring).toBe("excluded-control");
  });

  it("requires at least one claim", () => {
    expect(() =>
      parseEvidenceManifest({ ...validManifest, claims: [] }),
    ).toThrow(/at least one claim/i);
  });

  it("rejects duplicate claim IDs", () => {
    expect(() =>
      parseEvidenceManifest({
        ...validManifest,
        claims: [validManifest.claims[0], validManifest.claims[0]],
      }),
    ).toThrow(/claim IDs must be unique/i);
  });

  it("rejects duplicate evidence IDs within a claim", () => {
    const duplicateEvidence = [
      validManifest.claims[0].evidence[0],
      validManifest.claims[0].evidence[0],
    ];

    expect(() =>
      parseEvidenceManifest({
        ...validManifest,
        claims: [
          { ...validManifest.claims[0], evidence: duplicateEvidence },
        ],
      }),
    ).toThrow(/evidence IDs must be unique/i);
  });

  it.each([
    "C:/private/screenshot.png",
    "/private/screenshot.png",
    "../outside/screenshot.png",
    "docs/../../outside.png",
    "docs\\screenshots\\windows.png",
  ])("rejects unsafe artifact path %s", (unsafePath) => {
    const screenshot = {
      ...validManifest.claims[0].evidence[5],
      path: unsafePath,
    };

    expect(() =>
      parseEvidenceManifest({
        ...validManifest,
        claims: [
          {
            ...validManifest.claims[0],
            evidence: [
              ...validManifest.claims[0].evidence.slice(0, 5),
              screenshot,
            ],
          },
        ],
      }),
    ).toThrow(/repository-relative POSIX path/i);
  });

  it("rejects an unknown evidence type", () => {
    expect(() =>
      parseEvidenceManifest({
        ...validManifest,
        claims: [
          {
            ...validManifest.claims[0],
            evidence: [{ id: "unknown", type: "vibe", label: "Trust me" }],
          },
        ],
      }),
    ).toThrow();
  });

  it("rejects an invalid claim importance", () => {
    expect(() =>
      parseEvidenceManifest({
        ...validManifest,
        claims: [{ ...validManifest.claims[0], importance: "critical" }],
      }),
    ).toThrow();
  });
});
