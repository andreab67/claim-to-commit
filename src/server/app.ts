import express, {
  type ErrorRequestHandler,
  type Express,
} from "express";
import path from "node:path";

import type { RepositoryAudit } from "../shared/evidence.js";
import { PublicError, toPublicErrorBody } from "./errors.js";
import { createDemoRouter } from "./routes/demo.js";
import { createScansRouter } from "./routes/scans.js";
import { createScanStore, type ScanStore } from "./store/scan-store.js";

export interface AppOptions {
  store?: ScanStore;
  demoAudit?: RepositoryAudit;
  projectRoot?: string;
  clientDist?: string;
}

export function createApp(options: AppOptions = {}): Express {
  const app = express();
  const store = options.store ?? createScanStore(":memory:");
  const projectRoot = options.projectRoot ?? process.cwd();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));
  app.use((_request, response, next) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("X-Frame-Options", "DENY");
    next();
  });

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok", service: "claim-to-commit" });
  });

  app.use("/api/demo", createDemoRouter(options.demoAudit, projectRoot));
  app.use("/api/scans", createScansRouter(store));

  if (options.clientDist) {
    app.use(express.static(options.clientDist, { index: false }));
    app.use((request, response, next) => {
      if (request.method === "GET" && !request.path.startsWith("/api")) {
        response.sendFile(path.join(options.clientDist ?? "", "index.html"));
        return;
      }
      next();
    });
  }

  app.use((_request, response) => {
    const notFound = new PublicError(
      "ROUTE_NOT_FOUND",
      "That local route does not exist.",
      "Open the application home or use a documented API endpoint.",
      404,
    );
    response.status(notFound.status).json(toPublicErrorBody(notFound));
  });

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
