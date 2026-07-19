import { Router } from "express";

import { PublicError } from "../errors.js";
import { scanRepository } from "../scan/scan-repository.js";
import type { ScanStore } from "../store/scan-store.js";

export function createScansRouter(store: ScanStore): Router {
  const router = Router();

  router.get("/", (_request, response) => {
    response.json({ scans: store.list() });
  });

  router.post("/", async (request, response) => {
    const requestedPath =
      typeof request.body === "object" &&
      request.body !== null &&
      "path" in request.body &&
      typeof request.body.path === "string"
        ? request.body.path.trim()
        : "";

    if (!requestedPath) {
      throw new PublicError(
        "PATH_REQUIRED",
        "A local repository path is required.",
        "Enter the absolute path to a Git repository and scan again.",
      );
    }

    const audit = await scanRepository(requestedPath, store);
    response.status(201).json(audit);
  });

  router.get("/:scanId", (request, response) => {
    const audit = store.get(request.params.scanId);
    if (!audit) {
      throw new PublicError(
        "SCAN_NOT_FOUND",
        "That saved scan could not be found.",
        "Run the repository scan again to create a new immutable result.",
        404,
      );
    }
    response.json(audit);
  });

  return router;
}
