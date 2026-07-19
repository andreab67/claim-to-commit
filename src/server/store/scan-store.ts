import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

import type { RepositoryAudit } from "../../shared/evidence.js";

interface ScanRow {
  payload_json: string;
}

export interface ScanSummary {
  scanId: string;
  projectName: string;
  repositoryPath: string;
  revision: string;
  scannedAt: string;
  score: number;
}

interface SummaryRow {
  id: string;
  project_name: string;
  repository_path: string;
  revision: string;
  created_at: string;
  score: number;
}

export interface ScanStore {
  save: (audit: RepositoryAudit, repositoryPath: string) => void;
  get: (scanId: string) => RepositoryAudit | undefined;
  list: (limit?: number) => ScanSummary[];
  close: () => void;
}

export function createScanStore(databasePath: string): ScanStore {
  if (databasePath !== ":memory:") {
    mkdirSync(path.dirname(databasePath), { recursive: true });
  }

  const database = new Database(databasePath);
  database.pragma("journal_mode = WAL");
  database.exec(`
    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      project_name TEXT NOT NULL,
      repository_path TEXT NOT NULL,
      revision TEXT NOT NULL,
      created_at TEXT NOT NULL,
      score INTEGER NOT NULL,
      payload_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS scans_repository_revision
      ON scans(repository_path, revision);
  `);

  const insert = database.prepare(`
    INSERT INTO scans (
      id, project_name, repository_path, revision, created_at, score, payload_json
    ) VALUES (
      @id, @projectName, @repositoryPath, @revision, @createdAt, @score, @payload
    )
  `);
  const selectOne = database.prepare(
    "SELECT payload_json FROM scans WHERE id = ?",
  );
  const selectRecent = database.prepare(`
    SELECT id, project_name, repository_path, revision, created_at, score
    FROM scans
    ORDER BY created_at DESC
    LIMIT ?
  `);

  return {
    save(audit, repositoryPath) {
      insert.run({
        id: audit.scanId,
        projectName: audit.project.name,
        repositoryPath,
        revision: audit.repository.revision,
        createdAt: audit.scannedAt,
        score: audit.score,
        payload: JSON.stringify(audit),
      });
    },
    get(scanId) {
      const row = selectOne.get(scanId) as ScanRow | undefined;
      return row ? (JSON.parse(row.payload_json) as RepositoryAudit) : undefined;
    },
    list(limit = 10) {
      const boundedLimit = Math.min(Math.max(Math.trunc(limit), 1), 50);
      const rows = selectRecent.all(boundedLimit) as SummaryRow[];
      return rows.map((row) => ({
        scanId: row.id,
        projectName: row.project_name,
        repositoryPath: row.repository_path,
        revision: row.revision,
        scannedAt: row.created_at,
        score: row.score,
      }));
    },
    close() {
      database.close();
    },
  };
}
