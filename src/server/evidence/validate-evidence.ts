import type {
  EvidenceManifest,
  EvidenceReference,
  ResolvedEvidence,
} from "../../shared/evidence.js";
import { findCommit, type GitRepository } from "../git/git-client.js";
import { validateDecision } from "./decision-validator.js";
import {
  missingEvidence,
  resolvedEvidence,
} from "./evidence-result.js";
import { validateFile, validateScreenshot } from "./file-validator.js";
import { validateTest } from "./test-validator.js";

export interface EvidenceValidationContext {
  repositoryPath: string;
  repository: GitRepository;
  manifest: EvidenceManifest;
}

export async function validateEvidence(
  context: EvidenceValidationContext,
  reference: EvidenceReference,
): Promise<ResolvedEvidence> {
  switch (reference.type) {
    case "decision":
      return validateDecision(context.repositoryPath, reference);
    case "session": {
      const session = context.manifest.sessions.find(
        (candidate) => candidate.id === reference.sessionId,
      );
      return session
        ? resolvedEvidence(reference, session.summary, {
            sessionId: session.id,
            reference: session.reference,
          })
        : missingEvidence(
            reference,
            "SESSION_MISSING",
            `${reference.sessionId} is not declared in the evidence manifest.`,
          );
    }
    case "commit": {
      const commit = findCommit(context.repository, reference.sha);
      return commit
        ? resolvedEvidence(reference, commit.subject, {
            sha: commit.sha,
            authoredAt: commit.authoredAt,
            changedFiles: commit.files.length,
          })
        : missingEvidence(
            reference,
            "COMMIT_MISSING",
            `Commit ${reference.sha} could not be resolved in the scanned history.`,
            { sha: reference.sha },
          );
    }
    case "file":
      return validateFile(context.repositoryPath, context.repository, reference);
    case "test":
      return validateTest(context.repositoryPath, context.manifest, reference);
    case "screenshot":
      return validateScreenshot(context.repositoryPath, reference);
  }
}

export async function validateEvidenceCollection(
  context: EvidenceValidationContext,
  references: EvidenceReference[],
): Promise<ResolvedEvidence[]> {
  return Promise.all(references.map((reference) => validateEvidence(context, reference)));
}
