import type { AuditStatus, ClaimImportance } from "./evidence.js";

export const STATUS_LABELS: Record<AuditStatus, string> = {
  proven: "Proven",
  partial: "Partial",
  unsupported: "Unsupported",
};

export const STATUS_ORDER: AuditStatus[] = [
  "unsupported",
  "partial",
  "proven",
];

export const IMPORTANCE_WEIGHTS: Record<ClaimImportance, number> = {
  headline: 3,
  major: 2,
  supporting: 1,
};

export function isAuditStatus(value: string): value is AuditStatus {
  return value === "proven" || value === "partial" || value === "unsupported";
}
