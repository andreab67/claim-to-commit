import { readFile } from "node:fs/promises";

import type {
  EvidenceManifest,
  ResolvedEvidence,
  TestEvidenceReference,
} from "../../shared/evidence.js";
import {
  invalidEvidence,
  missingEvidence,
  resolvedEvidence,
} from "./evidence-result.js";
import { resolveContainedPath } from "./file-validator.js";

interface TestResultArtifact {
  status?: unknown;
  tests?: Array<{ id?: unknown; status?: unknown }>;
}

export async function validateTest(
  repositoryPath: string,
  manifest: EvidenceManifest,
  reference: TestEvidenceReference,
): Promise<ResolvedEvidence> {
  const declaration = manifest.tests.find((test) => test.id === reference.testId);
  if (!declaration) {
    return missingEvidence(
      reference,
      "TEST_DECLARATION_MISSING",
      `${reference.testId} is not declared in the evidence manifest.`,
    );
  }

  const resultPath = resolveContainedPath(repositoryPath, declaration.resultPath);
  if (!resultPath) {
    return invalidEvidence(
      reference,
      "TEST_RESULT_PATH_INVALID",
      "The declared test result path escapes the repository.",
    );
  }

  let artifact: TestResultArtifact;
  try {
    artifact = JSON.parse(await readFile(resultPath, "utf8")) as TestResultArtifact;
  } catch {
    return missingEvidence(
      reference,
      "TEST_RESULT_MISSING",
      `${declaration.resultPath} is missing or unreadable.`,
      { path: declaration.resultPath, command: declaration.command },
    );
  }

  const recordedTest = artifact.tests?.find((test) => test.id === reference.testId);
  const status = recordedTest?.status ?? artifact.status;
  if (status !== "passed") {
    return invalidEvidence(
      reference,
      "TEST_FAILED",
      `${reference.testId} does not have a passing recorded result.`,
      { path: declaration.resultPath, command: declaration.command },
    );
  }

  return resolvedEvidence(reference, `${declaration.command} passed.`, {
    path: declaration.resultPath,
    command: declaration.command,
    status: "passed",
  });
}
