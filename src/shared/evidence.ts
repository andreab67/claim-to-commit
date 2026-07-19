export const AUDIT_STATUSES = ["proven", "partial", "unsupported"] as const;
export type AuditStatus = (typeof AUDIT_STATUSES)[number];

export const CLAIM_IMPORTANCE = ["headline", "major", "supporting"] as const;
export type ClaimImportance = (typeof CLAIM_IMPORTANCE)[number];

export const EVIDENCE_TYPES = [
  "decision",
  "session",
  "commit",
  "file",
  "test",
  "screenshot",
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

interface EvidenceReferenceBase {
  id: string;
  label: string;
  required?: boolean;
}

export interface DecisionEvidenceReference extends EvidenceReferenceBase {
  type: "decision";
  decisionId: string;
}

export interface SessionEvidenceReference extends EvidenceReferenceBase {
  type: "session";
  sessionId: string;
}

export interface CommitEvidenceReference extends EvidenceReferenceBase {
  type: "commit";
  sha: string;
}

export interface FileEvidenceReference extends EvidenceReferenceBase {
  type: "file";
  path: string;
  commit?: string;
}

export interface TestEvidenceReference extends EvidenceReferenceBase {
  type: "test";
  testId: string;
}

export interface ScreenshotEvidenceReference extends EvidenceReferenceBase {
  type: "screenshot";
  path: string;
  caption: string;
}

export type EvidenceReference =
  | DecisionEvidenceReference
  | SessionEvidenceReference
  | CommitEvidenceReference
  | FileEvidenceReference
  | TestEvidenceReference
  | ScreenshotEvidenceReference;

export interface BuildSession {
  id: string;
  label: string;
  summary: string;
  reference: string;
}

export interface TestDeclaration {
  id: string;
  command: string;
  resultPath: string;
}

export interface Claim {
  id: string;
  title: string;
  description: string;
  importance: ClaimImportance;
  userVisible: boolean;
  evidence: EvidenceReference[];
}

export interface EvidenceManifest {
  schemaVersion: 1;
  project: {
    name: string;
    description: string;
  };
  sessions: BuildSession[];
  tests: TestDeclaration[];
  claims: Claim[];
}

export type EvidenceResolution = "resolved" | "missing" | "invalid";

export interface ResolvedEvidence {
  id: string;
  type: EvidenceType;
  label: string;
  resolution: EvidenceResolution;
  detail: string;
  required: boolean;
  metadata: Record<string, string | number | boolean>;
}

export type FindingSeverity = "info" | "warning" | "error";

export interface Finding {
  code: string;
  severity: FindingSeverity;
  message: string;
  guidance: string;
  evidenceId?: string;
}

export interface ClaimAudit {
  id: string;
  title: string;
  description: string;
  importance: ClaimImportance;
  userVisible: boolean;
  status: AuditStatus;
  evidence: ResolvedEvidence[];
  findings: Finding[];
}

export interface RepositoryAudit {
  scanId: string;
  scannedAt: string;
  source: "bundled" | "live";
  project: EvidenceManifest["project"];
  repository: {
    displayPath: string;
    branch: string;
    revision: string;
  };
  score: number;
  formula: string;
  counts: Record<AuditStatus, number>;
  claims: ClaimAudit[];
}
