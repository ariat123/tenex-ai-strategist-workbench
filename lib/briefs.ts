import type {
  AdoptionRisk,
  DiscoveryInput,
  EvidenceBackedClaim,
  EvidenceItem,
  RolloutPhase,
  ScoredOpportunity,
  Stakeholder,
  ValueMetric,
} from "@/lib/types";
import { fallbackText, sentenceList } from "@/lib/format";

export function buildCurrentStateSummary(discovery: DiscoveryInput) {
  return `${fallbackText(discovery.companyName, "The client")} is evaluating ${fallbackText(
    discovery.workflowName,
    "a priority workflow",
  )} in ${fallbackText(discovery.domain, "its operating environment")}. The current motion runs through ${sentenceList(
    discovery.systemsInvolved,
    "multiple systems",
  )} and is constrained by ${fallbackText(
    discovery.constraints,
    "unclear ownership, fragmented data, and manual exception handling",
  )}. The executive goal is ${fallbackText(
    discovery.executiveGoal,
    "to improve cycle time, quality, and operating visibility",
  )}. ${fallbackText(
    discovery.workflowOwner,
    "The workflow owner",
  )} owns the baseline metric: ${fallbackText(discovery.baselineMetric)}.`;
}

export function buildBottlenecks(discovery: DiscoveryInput) {
  return [
    discovery.currentWorkflowSteps.length > 4
      ? "Workflow has several handoff points where work can stall or be re-keyed."
      : "Workflow has a small number of steps, but ownership and review points still need validation.",
    discovery.systemsInvolved.length > 2
      ? "Operators are likely reconciling context across systems before taking action."
      : "System count is manageable, but the pilot should confirm source-of-truth ownership.",
    discovery.knownFailureModes.length
      ? `Known failure modes include ${sentenceList(discovery.knownFailureModes)}.`
      : "Failure modes have not been fully captured yet; early discovery should focus on exceptions.",
    discovery.adoptionConcerns
      ? `Adoption concern: ${discovery.adoptionConcerns}`
      : "Adoption risks are not fully stated yet; assume frontline trust and manager visibility matter.",
  ];
}

export function buildRolloutPlan(
  discovery: DiscoveryInput,
  pilot: ScoredOpportunity,
): RolloutPhase[] {
  return [
    {
      phase: "30 days",
      focus: "Validate discovery and narrow the pilot",
      activities: [
        `Shadow ${fallbackText(discovery.workflowName, "the workflow")} with operators and managers.`,
        `Confirm ${fallbackText(
          discovery.baselineMetric,
          "the baseline metric",
        )}, exception categories, and required review: ${fallbackText(
          discovery.humanReviewPoint,
        )}.`,
        `Align stakeholders on MVP scope for ${pilot.title}.`,
        "Document data fields, system ownership, and access constraints for the FDE team.",
      ],
    },
    {
      phase: "60 days",
      focus: "Build MVP and run controlled rollout",
      activities: [
        "Build the first workflow path with traceable inputs, outputs, and review states.",
        "Pilot with a small operator group and a clear escalation channel.",
        "Review false positives, missed cases, latency, and user feedback weekly.",
        "Create exception handling guidance before expanding usage.",
      ],
    },
    {
      phase: "90 days",
      focus: "Expand adoption and choose the next workflow",
      activities: [
        "Compare KPI movement against baseline and decision quality targets.",
        "Expand to adjacent teams only after manager trust and usage are visible.",
        "Turn field learnings into reusable discovery and deployment playbook notes.",
        "Select the next workflow using the same scorecard rather than stakeholder volume alone.",
      ],
    },
  ];
}

export function buildFdeHandoffBrief(
  discovery: DiscoveryInput,
  pilot: ScoredOpportunity,
  risks: AdoptionRisk[],
  metrics: ValueMetric[],
  assumptionsToValidate: EvidenceBackedClaim[] = [],
  discoveryEvidence: EvidenceItem[] = [],
) {
  return `# FDE Handoff Brief

## Problem statement
${fallbackText(discovery.companyName, "The client")} needs a focused pilot for ${fallbackText(
    discovery.workflowName,
    "the target workflow",
  )}. The current process creates delay, inconsistent triage, and limited operating visibility. ${fallbackText(
    discovery.workflowOwner,
    "The workflow owner",
  )} owns the operating baseline: ${fallbackText(discovery.baselineMetric)}.

## Discovery evidence
${discoveryEvidence
    .map((item) => `- ${item.text}${item.quote ? ` (source: "${item.quote}")` : ""}`)
    .join("\n")}

## Current workflow
${discovery.currentWorkflowSteps.map((step, index) => `${index + 1}. ${step}`).join("\n")}

## Target workflow
${pilot.targetWorkflow}

## Systems involved
${discovery.systemsInvolved.map((system) => `- ${system}`).join("\n")}

## Inputs and data sources
- Discovery notes from stakeholders and operators
- Workflow records from ${sentenceList(discovery.systemsInvolved, "source systems")}
- Exception and failure-mode examples
- Baseline KPI extracts for volume, time, quality, and adoption

## Outputs
- Prioritized work item or recommendation
- Explanation visible to the human reviewer
- Routed next action or draft follow-up
- Metric events for adoption and quality tracking

## Human review points
- ${fallbackText(discovery.humanReviewPoint)}
- First-pass routing decisions
- High-risk or ambiguous records
- Customer, patient, broker, or portfolio-company-facing outputs
- Any case matching known failure modes

## Edge cases
${discovery.knownFailureModes.map((mode) => `- ${mode}`).join("\n")}

## Failure modes
${risks.map((risk) => `- ${risk.risk}: ${risk.signal}`).join("\n")}

## Build assumptions
- V1 uses deterministic business rules and review workflows before deeper automation.
- Operators can see why the system suggested an action.
- The pilot writes enough activity data to measure adoption and quality.
- ${fallbackText(discovery.workflowOwner, "The workflow owner")} can review pilot feedback and metric movement weekly.
- Source-system access and sample records are available during discovery validation.
${assumptionsToValidate.map((claim) => `- ${claim.text}`).join("\n")}

## Open questions
- Which system is the source of truth for status and ownership?
- What case types are explicitly out of bounds for MVP?
- Who can approve the first controlled rollout cohort?
- Which metric will determine whether to expand at day 90?

## MVP scope
${pilot.description}

## What not to build yet
${pilot.notYet}

## Success metrics
${metrics.map((metric) => `- ${metric.name}: ${metric.baseline} -> ${metric.target}`).join("\n")}
`;
}

export function buildStrategistBrief(
  discovery: DiscoveryInput,
  scoredOpportunities: ScoredOpportunity[],
  stakeholders: Stakeholder[],
  risks: AdoptionRisk[],
  metrics: ValueMetric[],
  discoveryEvidence: EvidenceItem[] = [],
  assumptionsToValidate: EvidenceBackedClaim[] = [],
  workflowBottlenecks: EvidenceBackedClaim[] = [],
  recommendedPilot?: ScoredOpportunity,
) {
  const pilot = recommendedPilot ?? scoredOpportunities[0];
  const bottlenecks = workflowBottlenecks.length
    ? workflowBottlenecks.map((item) => item.text)
    : buildBottlenecks(discovery);

  return `# Strategist Brief

## Client and workflow
Client: ${fallbackText(discovery.companyName)}
Domain: ${fallbackText(discovery.domain)}
Workflow: ${fallbackText(discovery.workflowName)}
Workflow owner: ${fallbackText(discovery.workflowOwner)}
Baseline metric: ${fallbackText(discovery.baselineMetric)}
Required human review point: ${fallbackText(discovery.humanReviewPoint)}
Executive goal: ${fallbackText(discovery.executiveGoal)}

## Current-state summary
${buildCurrentStateSummary(discovery)}

## Discovery evidence
${discoveryEvidence
    .map((item) => `- ${item.text}${item.quote ? ` (source: "${item.quote}")` : ""}`)
    .join("\n")}

## Assumptions to validate
${assumptionsToValidate.map((item) => `- ${item.text}`).join("\n")}

## Top bottlenecks
${bottlenecks.map((item) => `- ${item}`).join("\n")}

## Ranked AI opportunities
${scoredOpportunities
    .map(
      (opportunity, index) =>
        `${index + 1}. ${opportunity.title} - ${opportunity.weightedScore}/100 (${opportunity.explanation})`,
    )
    .join("\n")}

## Recommended first pilot
${pilot.title}
Score: ${pilot.weightedScore}/100
Why first: ${pilot.rationale}
Target workflow: ${pilot.targetWorkflow}
What not to automate yet: ${pilot.notYet}

## Stakeholder map
${stakeholders
    .map(
      (stakeholder) =>
        `- ${stakeholder.role}: ${stakeholder.concern}. Alignment move: ${stakeholder.alignmentMove}`,
    )
    .join("\n")}

## Adoption risk register
${risks
    .map((risk) => `- ${risk.risk}: ${risk.mitigation} (${risk.owner})`)
    .join("\n")}

## Value measurement plan
${metrics
    .map(
      (metric) =>
        `- ${metric.name}: baseline ${metric.baseline}; target ${metric.target}; owner ${metric.owner}; cadence ${metric.cadence}; confidence ${metric.confidence}`,
    )
    .join("\n")}

## FDE handoff focus
Start with ${pilot.title} as a reviewed workflow assistant. Prioritize traceability, exception handling, and measurable adoption over full autonomy.
`;
}
