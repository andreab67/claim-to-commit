import type {
  EvidenceReference,
  EvidenceResolution,
  ResolvedEvidence,
} from "../../shared/evidence.js";

export function resolvedEvidence(
  reference: EvidenceReference,
  detail: string,
  metadata: ResolvedEvidence["metadata"] = {},
): ResolvedEvidence {
  return createEvidence(reference, "resolved", detail, metadata);
}

export function missingEvidence(
  reference: EvidenceReference,
  findingCode: string,
  detail: string,
  metadata: ResolvedEvidence["metadata"] = {},
): ResolvedEvidence {
  return createEvidence(reference, "missing", detail, {
    ...metadata,
    findingCode,
  });
}

export function invalidEvidence(
  reference: EvidenceReference,
  findingCode: string,
  detail: string,
  metadata: ResolvedEvidence["metadata"] = {},
): ResolvedEvidence {
  return createEvidence(reference, "invalid", detail, {
    ...metadata,
    findingCode,
  });
}

function createEvidence(
  reference: EvidenceReference,
  resolution: EvidenceResolution,
  detail: string,
  metadata: ResolvedEvidence["metadata"],
): ResolvedEvidence {
  return {
    id: reference.id,
    type: reference.type,
    label: reference.label,
    resolution,
    detail,
    required: reference.required ?? true,
    metadata,
  };
}
