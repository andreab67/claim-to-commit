import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const children = [
  spawn(npmCommand, ["exec", "tsx", "watch", "src/server/index.ts"], {
    stdio: "inherit",
  }),
  spawn(npmCommand, ["exec", "vite"], {
    stdio: "inherit",
  }),
];

let shuttingDown = false;

function shutdown(signal = "SIGTERM") {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }
}

for (const child of children) {
  child.on("exit", (code) => {
    if (!shuttingDown && code !== 0) {
      shutdown();
      process.exitCode = code ?? 1;
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
