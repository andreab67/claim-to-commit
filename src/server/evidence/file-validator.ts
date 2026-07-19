import { stat } from "node:fs/promises";
import path from "node:path";

import type {
  FileEvidenceReference,
  ResolvedEvidence,
  ScreenshotEvidenceReference,
} from "../../shared/evidence.js";
import { findCommit, type GitRepository } from "../git/git-client.js";
import {
  invalidEvidence,
  missingEvidence,
  resolvedEvidence,
} from "./evidence-result.js";

export async function validateFile(
  repositoryPath: string,
  repository: GitRepository,
  reference: FileEvidenceReference,
): Promise<ResolvedEvidence> {
  const filePath = resolveContainedPath(repositoryPath, reference.path);
  if (!filePath || !(await isFile(filePath))) {
    return missingEvidence(
      reference,
      "FILE_MISSING",
      `${reference.path} does not exist in the repository.`,
      { path: reference.path },
    );
  }

  if (reference.commit) {
    const commit = findCommit(repository, reference.commit);
    if (!commit) {
      return invalidEvidence(
        reference,
        "FILE_COMMIT_MISSING",
        `The attributed commit ${reference.commit} could not be resolved.`,
        { path: reference.path, commit: reference.commit },
      );
    }
    if (!commit.files.includes(reference.path)) {
      return invalidEvidence(
        reference,
        "FILE_NOT_CHANGED_IN_COMMIT",
        `${reference.path} was not changed by ${commit.sha.slice(0, 8)}.`,
        { path: reference.path, commit: commit.sha },
      );
    }
  }

  return resolvedEvidence(reference, `${reference.path} exists and is attributable.`, {
    path: reference.path,
    ...(reference.commit ? { commit: reference.commit } : {}),
  });
}

export async function validateScreenshot(
  repositoryPath: string,
  reference: ScreenshotEvidenceReference,
): Promise<ResolvedEvidence> {
  const screenshotPath = resolveContainedPath(repositoryPath, reference.path);
  if (!screenshotPath || !(await isFile(screenshotPath))) {
    return missingEvidence(
      reference,
      "SCREENSHOT_MISSING",
      `${reference.path} does not exist in the repository.`,
      { path: reference.path },
    );
  }

  return resolvedEvidence(reference, reference.caption, {
    path: reference.path,
    caption: reference.caption,
  });
}

export function resolveContainedPath(
  repositoryPath: string,
  relativePath: string,
): string | undefined {
  const root = path.resolve(repositoryPath);
  const candidate = path.resolve(root, ...relativePath.split("/"));
  return candidate.startsWith(`${root}${path.sep}`) ? candidate : undefined;
}

async function isFile(filePath: string): Promise<boolean> {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}
