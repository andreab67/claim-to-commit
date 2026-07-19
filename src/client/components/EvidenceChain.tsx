import type { ResolvedEvidence } from "../../shared/evidence.js";

interface EvidenceChainProps {
  evidence: ResolvedEvidence[];
  auditMode: boolean;
}

const TYPE_LABELS: Record<ResolvedEvidence["type"], string> = {
  decision: "Decision",
  session: "Session",
  commit: "Commit",
  file: "File",
  test: "Test",
  screenshot: "Screenshot",
};

const TYPE_SIGNS: Record<ResolvedEvidence["type"], string> = {
  decision: "D",
  session: "S",
  commit: "C",
  file: "F",
  test: "T",
  screenshot: "V",
};

export function EvidenceChain({ evidence, auditMode }: EvidenceChainProps) {
  return (
    <ol className="evidence-chain" aria-label="Evidence chain">
      {evidence.map((item, index) => (
        <li
          key={item.id}
          className={`evidence-node resolution-${item.resolution}${
            auditMode && item.resolution !== "resolved" ? " is-exposed" : ""
          }`}
        >
          <div className="node-rail" aria-hidden="true">
            <span className="node-sign">{TYPE_SIGNS[item.type]}</span>
            {index < evidence.length - 1 ? <span className="node-connector" /> : null}
          </div>
          <div className="node-card">
            <div className="node-heading">
              <span>{TYPE_LABELS[item.type]}</span>
              <span className="resolution-label">
                {item.resolution === "resolved" ? "Verified" : item.resolution}
              </span>
            </div>
            <strong>{item.label}</strong>
            <p>{item.detail}</p>
            <NodeMetadata evidence={item} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function NodeMetadata({ evidence }: { evidence: ResolvedEvidence }) {
  const value =
    (typeof evidence.metadata.sha === "string" && evidence.metadata.sha.slice(0, 8)) ||
    (typeof evidence.metadata.path === "string" && evidence.metadata.path) ||
    (typeof evidence.metadata.decisionId === "string" && evidence.metadata.decisionId) ||
    (typeof evidence.metadata.command === "string" && evidence.metadata.command) ||
    (typeof evidence.metadata.reference === "string" && evidence.metadata.reference) ||
    "Declared evidence";

  return <code>{value}</code>;
}
