# Claim to Commit Decision Ledger

This ledger records the human product and scope decisions that shape Claim to Commit. Stable identifiers let the application connect a product claim to its rationale without pretending a generated summary is the source of truth.

## DEC-001: Prefer explicit evidence over semantic guessing

**Date:** July 18, 2026  
**Context:** Automatically inferring relationships among prose, commits, tests, and screenshots is attractive but unreliable within the competition deadline. A false link would undermine the product's central trust promise.  
**Decision:** Repositories opt in through `.claim-to-commit/evidence.json`. The scanner verifies declared references and never invents a relationship.  
**Consequence:** Setup requires a small manifest, while every audit result remains deterministic and explainable.

## DEC-002: Keep repository inspection local and read only

**Date:** July 18, 2026  
**Context:** Source code, local paths, and agent-session references may be sensitive. A hosted integration would add authentication, data handling, and network failure modes.  
**Decision:** Bind the server to localhost, use read-only Git commands with argument arrays, and perform no repository mutation or external upload.  
**Consequence:** The demonstration requires a local clone but needs no account, token, paid service, or secret.

## DEC-003: Grade evidence with public deterministic rules

**Date:** July 18, 2026  
**Context:** A proprietary confidence score would reproduce the exact trust problem the product is meant to solve.  
**Decision:** A proven claim requires a resolvable implementation commit, an attributable changed file, and a passing test. User-visible claims also require a screenshot. Importance weights are headline 3, major 2, and supporting 1.  
**Consequence:** Reviewers can reproduce every status and see the score formula in the interface.

## DEC-004: Make the product audit its own build

**Date:** July 18, 2026  
**Context:** A synthetic repository would demonstrate mechanics but would not prove that the workflow handles a real Codex-assisted build.  
**Decision:** Ship a deterministic bundled fixture for zero-friction judging and a live self-audit manifest backed by this repository's actual decisions, commits, files, tests, and screenshots.  
**Consequence:** The three-minute demo can start instantly and then reveal real dated build evidence.

## DEC-005: Optimize the submission for evidence, not feature count

**Date:** July 18, 2026  
**Context:** Judges may never run the code, and the deadline is fixed.  
**Decision:** Prioritize the evidence chain, Audit Mode reveal, self-scan, screenshots, demo script, and fresh-clone path. Exclude authentication, hosted Git providers, semantic inference, cloud deployment, dark mode, payments, and unrelated settings.  
**Consequence:** Claim to Commit can be a complete focused product instead of a broad unfinished platform.

## DEC-006: Keep negative audit controls outside shipped-claim coverage

**Date:** July 18, 2026  
**Context:** The deliberately unsupported semantic-inference example proves that Audit Mode catches confident prose, but counting that test control as shipped scope makes a fully evidenced build appear incomplete.  
**Decision:** A claim may explicitly declare `scoring: "excluded-control"`. It remains visible, unsupported, and inspectable, while the numerator and denominator include only shipped claims. The UI must disclose both the exclusion and the complete formula.  
**Consequence:** The self-audit honestly reports 100% coverage for four shipped claims while preserving one red negative control for the demonstration.

## Scope-cut rule

If a vertical slice stalls for approximately 45 focused minutes, record the attempted scope, the narrower replacement, and the effect here before continuing. The submission package begins no later than July 20, 2026 at 5:00 PM Pacific Time.
