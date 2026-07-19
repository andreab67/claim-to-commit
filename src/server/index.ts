import { createApp } from "./app.js";

const host = "127.0.0.1";
const parsedPort = Number.parseInt(process.env.PORT ?? "8787", 10);
const port = Number.isFinite(parsedPort) ? parsedPort : 8787;

const server = createApp().listen(port, host, () => {
  console.log(`Claim to Commit API ready at http://${host}:${port}`);
});

function shutdown(signal: string) {
  console.log(`\n${signal} received. Closing local server.`);
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
