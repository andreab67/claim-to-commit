import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const [major = 0, minor = 0] = process.versions.node
  .split(".")
  .map((part) => Number.parseInt(part, 10));

if (major < 22 || (major === 22 && minor < 12)) {
  console.error(
    `Claim to Commit requires Node.js 22.12 or newer. Found ${process.versions.node}.`,
  );
  process.exit(1);
}

const npmExecPath = process.env.npm_execpath;
const npmCommand = npmExecPath ? process.execPath : "npm";
const npmPrefix = npmExecPath ? [npmExecPath] : [];
const projectRoot = process.cwd();
const installedLock = path.join(projectRoot, "node_modules", ".package-lock.json");
const projectNpmConfig = path.join(projectRoot, ".npmrc");
const installEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key]) =>
      key.toLowerCase() !== "npm_config_userconfig" &&
      key.toLowerCase() !== "npm_config_allow_scripts",
  ),
);
installEnvironment.npm_config_userconfig = projectNpmConfig;

if (!existsSync(installedLock)) {
  run("Installing locked dependencies", ["ci"], installEnvironment);
}

run("Building the local application", ["run", "build"]);

console.log("\nClaim to Commit is ready: http://127.0.0.1:8787");
console.log("Press Ctrl+C to stop the local server.\n");

const server = spawn(npmCommand, [...npmPrefix, "start"], {
  cwd: projectRoot,
  stdio: "inherit",
  windowsHide: true,
});

server.on("exit", (code) => {
  process.exitCode = code ?? 0;
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    if (!server.killed) server.kill(signal);
  });
}

function run(label, args, environment = process.env) {
  console.log(`\n${label}…`);
  const result = spawnSync(npmCommand, [...npmPrefix, ...args], {
    cwd: projectRoot,
    env: environment,
    stdio: "inherit",
    windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
