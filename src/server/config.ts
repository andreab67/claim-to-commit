import path from "node:path";

export interface ServerConfig {
  host: "127.0.0.1";
  port: number;
  projectRoot: string;
  databasePath: string;
}

export function resolveConfig(): ServerConfig {
  const projectRoot = process.cwd();
  const parsedPort = Number.parseInt(process.env.PORT ?? "8787", 10);
  const dataDirectory = path.resolve(
    projectRoot,
    process.env.CLAIM_TO_COMMIT_DATA_DIR ?? ".data",
  );

  return {
    host: "127.0.0.1",
    port: Number.isFinite(parsedPort) ? parsedPort : 8787,
    projectRoot,
    databasePath: path.join(dataDirectory, "scans.sqlite"),
  };
}
