import { writeFile } from "node:fs/promises";
import path from "node:path";

import { scanRepository } from "../dist/server/server/scan/scan-repository.js";
import { createScanStore } from "../dist/server/server/store/scan-store.js";

const projectRoot = process.cwd();
const store = createScanStore(":memory:");

try {
  const liveAudit = await scanRepository(projectRoot, store);
  const demoAudit = {
    ...liveAudit,
    scanId: "demo-claim-to-commit",
    scannedAt: "2026-07-19T01:10:03.000Z",
    source: "bundled",
    repository: {
      ...liveAudit.repository,
      displayPath: "claim-to-commit · bundled evidence snapshot",
    },
  };

  await writeFile(
    path.join(projectRoot, "fixtures", "demo-scan.json"),
    `${JSON.stringify(demoAudit, null, 2)}\n`,
  );
  console.log(
    `Bundled demo written with ${demoAudit.claims.length} claims and a ${demoAudit.score}% proof score.`,
  );
} finally {
  store.close();
}
