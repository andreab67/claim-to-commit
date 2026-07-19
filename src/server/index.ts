import { createApp } from "./app.js";
import { resolveConfig } from "./config.js";
import { createScanStore } from "./store/scan-store.js";

const config = resolveConfig();
const store = createScanStore(config.databasePath);

const server = createApp({
  store,
  projectRoot: config.projectRoot,
}).listen(config.port, config.host, () => {
  console.log(`Claim to Commit API ready at http://${config.host}:${config.port}`);
});

function shutdown(signal: string) {
  console.log(`\n${signal} received. Closing local server.`);
  server.close((error) => {
    store.close();
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
