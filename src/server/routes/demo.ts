import { readFile } from "node:fs/promises";
import path from "node:path";
import { Router } from "express";

import type { RepositoryAudit } from "../../shared/evidence.js";
import { PublicError } from "../errors.js";

export function createDemoRouter(
  demoAudit: RepositoryAudit | undefined,
  projectRoot: string,
): Router {
  const router = Router();

  router.get("/", async (_request, response) => {
    if (demoAudit) {
      response.json(demoAudit);
      return;
    }

    try {
      const contents = await readFile(
        path.join(projectRoot, "fixtures", "demo-scan.json"),
        "utf8",
      );
      const audit = JSON.parse(contents) as RepositoryAudit;
      if (!Array.isArray(audit.claims) || typeof audit.score !== "number") {
        throw new Error("Fixture shape is invalid.");
      }
      response.json(audit);
    } catch {
      throw new PublicError(
        "DEMO_UNAVAILABLE",
        "The bundled evidence demonstration is unavailable.",
        "Restore fixtures/demo-scan.json or run a live repository scan.",
        503,
      );
    }
  });

  return router;
}
