import express, {
  type ErrorRequestHandler,
  type Express,
} from "express";

import type { RepositoryAudit } from "../shared/evidence.js";
import { PublicError, toPublicErrorBody } from "./errors.js";
import { createDemoRouter } from "./routes/demo.js";
import { createScansRouter } from "./routes/scans.js";
import { createScanStore, type ScanStore } from "./store/scan-store.js";

export interface AppOptions {
  store?: ScanStore;
  demoAudit?: RepositoryAudit;
  projectRoot?: string;
}

export function createApp(options: AppOptions = {}): Express {
  const app = express();
  const store = options.store ?? createScanStore(":memory:");
  const projectRoot = options.projectRoot ?? process.cwd();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok", service: "claim-to-commit" });
  });

  app.use("/api/demo", createDemoRouter(options.demoAudit, projectRoot));
  app.use("/api/scans", createScansRouter(store));

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    const publicError =
      error instanceof PublicError
        ? error
        : new PublicError(
            "INTERNAL_ERROR",
            "Claim to Commit could not complete that request.",
            "Try again or open the bundled demonstration.",
            500,
          );
    response.status(publicError.status).json(toPublicErrorBody(publicError));
  };
  app.use(errorHandler);

  return app;
}
