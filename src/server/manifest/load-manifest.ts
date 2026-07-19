import { readFile } from "node:fs/promises";
import path from "node:path";
import { ZodError } from "zod";

import type { EvidenceManifest } from "../../shared/evidence.js";
import { parseEvidenceManifest } from "../../shared/schema.js";
import { PublicError } from "../errors.js";

const MANIFEST_PATH = path.join(".claim-to-commit", "evidence.json");

export async function loadManifest(
  repositoryPath: string,
): Promise<EvidenceManifest> {
  const manifestPath = path.join(repositoryPath, MANIFEST_PATH);

  let contents: string;
  try {
    contents = await readFile(manifestPath, "utf8");
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      throw new PublicError(
        "MANIFEST_NOT_FOUND",
        "This repository has not declared its product evidence.",
        "Add .claim-to-commit/evidence.json or open the bundled demonstration.",
        404,
      );
    }
    throw new PublicError(
      "MANIFEST_UNREADABLE",
      "The evidence manifest could not be read.",
      "Confirm the repository and manifest are readable, then scan again.",
    );
  }

  try {
    return parseEvidenceManifest(JSON.parse(contents) as unknown);
  } catch (error) {
    const reason =
      error instanceof ZodError
        ? error.issues[0]?.message ?? "The manifest does not match schema version 1."
        : error instanceof SyntaxError
          ? error.message
          : "The manifest could not be validated.";
    throw new PublicError(
      "MANIFEST_INVALID",
      `The evidence manifest is invalid: ${reason}`,
      "Correct the reported JSON or schema issue and scan the repository again.",
    );
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
