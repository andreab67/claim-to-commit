import path from "node:path";
import { z } from "zod";

import type { EvidenceManifest } from "./evidence.js";

const identifier = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/, "Use a stable identifier.");

const repositoryPath = z.string().min(1).refine(
  (value) => {
    if (value.includes("\\") || path.posix.isAbsolute(value)) return false;
    if (/^[a-zA-Z]:/.test(value)) return false;
    const normalized = path.posix.normalize(value);
    return (
      normalized === value &&
      normalized !== ".." &&
      !normalized.startsWith("../")
    );
  },
  { message: "Use a repository-relative POSIX path without traversal." },
);

const evidenceBase = {
  id: identifier,
  label: z.string().min(1).max(140),
  required: z.boolean().optional(),
};

const evidenceReferenceSchema = z.discriminatedUnion("type", [
  z.object({
    ...evidenceBase,
    type: z.literal("decision"),
    decisionId: identifier,
  }),
  z.object({
    ...evidenceBase,
    type: z.literal("session"),
    sessionId: identifier,
  }),
  z.object({
    ...evidenceBase,
    type: z.literal("commit"),
    sha: z.string().regex(/^[a-fA-F0-9]{7,40}$/, "Use a Git commit SHA."),
  }),
  z.object({
    ...evidenceBase,
    type: z.literal("file"),
    path: repositoryPath,
    commit: z
      .string()
      .regex(/^[a-fA-F0-9]{7,40}$/, "Use a Git commit SHA.")
      .optional(),
  }),
  z.object({
    ...evidenceBase,
    type: z.literal("test"),
    testId: identifier,
  }),
  z.object({
    ...evidenceBase,
    type: z.literal("screenshot"),
    path: repositoryPath,
    caption: z.string().min(1).max(240),
  }),
]);

const claimSchema = z
  .object({
    id: identifier,
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(600),
    importance: z.enum(["headline", "major", "supporting"]),
    userVisible: z.boolean(),
    evidence: z.array(evidenceReferenceSchema).min(1),
  })
  .superRefine((claim, context) => {
    const seen = new Set<string>();
    claim.evidence.forEach((evidence, index) => {
      if (seen.has(evidence.id)) {
        context.addIssue({
          code: "custom",
          path: ["evidence", index, "id"],
          message: "Evidence IDs must be unique within a claim.",
        });
      }
      seen.add(evidence.id);
    });
  });

export const evidenceManifestSchema = z
  .object({
    schemaVersion: z.literal(1),
    project: z.object({
      name: z.string().min(1).max(100),
      description: z.string().min(1).max(500),
    }),
    sessions: z.array(
      z.object({
        id: identifier,
        label: z.string().min(1).max(120),
        summary: z.string().min(1).max(500),
        reference: z.string().min(1).max(240),
      }),
    ),
    tests: z.array(
      z.object({
        id: identifier,
        command: z.string().min(1).max(300),
        resultPath: repositoryPath,
      }),
    ),
    claims: z.array(claimSchema).min(1, "Manifest requires at least one claim."),
  })
  .superRefine((manifest, context) => {
    for (const [collectionName, items] of [
      ["sessions", manifest.sessions],
      ["tests", manifest.tests],
      ["claims", manifest.claims],
    ] as const) {
      const seen = new Set<string>();
      items.forEach((item, index) => {
        if (seen.has(item.id)) {
          context.addIssue({
            code: "custom",
            path: [collectionName, index, "id"],
            message: `${collectionName.slice(0, -1).replace(/^./, (letter) => letter.toUpperCase())} IDs must be unique.`,
          });
        }
        seen.add(item.id);
      });
    }
  });

export function parseEvidenceManifest(input: unknown): EvidenceManifest {
  return evidenceManifestSchema.parse(input) as EvidenceManifest;
}
