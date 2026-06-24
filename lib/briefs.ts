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
import {
  cleanGeneratedText,
  cleanOpportunityTitle,
  sentence,
} from "@/lib/artifact-copy";

function cleanList(items: string[]) {
  return items.map(cleanGeneratedText).filter(Boolean);
}

function markdownList(items: string[], fallback = "Not specified yet") {
  const cleaned = cleanList(items);

  return cleaned.length ? cleaned.map((item) => `- ${item}`).join("\n") : `- ${fallback}`;
}

function domainPhrase(discovery: DiscoveryInput) {
  const domain = cleanGeneratedText(discovery.domain);
  const workflow = cleanGeneratedText(discovery.workflowName);
  const domainWords = domain.toLowerCase().split(/\W+/).filter((word) => word.length > 3);
  const workflowWords = new Set(
    workflow.toLowerCase().split(/\W+/).filter((word) => word.length > 3),
  );
  const overlaps = domainWords.some(
    (word) =>
      workflowWords.has(word) ||
      workflowWords.has(word.replace(/s$/, "")) ||
      workflowWords.has(`${word}s`),
  );

  if (!domain || workflow.toLowerCase().includes(domain.toLowerCase()) || overlaps) {
    return "";
  }

  return ` in ${domain}`;
}

export function buildNextStrategistAction(
  discovery: DiscoveryInput,
  pilot: ScoredOpportunity,
) {
  const pilotTitle = cleanOpportunityTitle(pilot.title, discovery);

  return `Validate ${fallbackText(
    discovery.baselineMetric,
    "the baseline metric",
  )} with ${fallbackText(
    discovery.workflowOwner,
    "the workflow owner",
  )}, then lock MVP scope and review rules for ${pilotTitle}.`;
}

export function buildCurrentStateSummary(discovery: DiscoveryInput) {
  const company = fallbackText(discovery.companyName, "The client");
  const workflow = fallbackText(discovery.workflowName, "the target workflow");
  const systems = sentenceList(discovery.systemsInvolved, "multiple systems");
  const baseline = fallbackText(discovery.baselineMetric);
  const goal = fallbackText(
    discovery.executiveGoal,
    "improve cycle time, quality, and operating visibility",
  );
  const constraints = fallbackText(
    discovery.constraints,
    "human review, clear system boundaries, and measurable value",
  );

  return [
    sentence(`${company} needs to improve ${workflow}${domainPhrase(discovery)}`),
    sentence(`Work currently runs through ${systems}`),
    sentence(`The measurable baseline is ${baseline}, and the goal is ${goal}`),
    sentence(`Pilot boundaries: ${constraints}`),
  ].join(" ");
}

function buildProblemStatement(discovery: DiscoveryInput) {
  return `${fallbackText(discovery.companyName, "The client")} needs a focused pilot for ${fallbackText(
    discovery.workflowName,
    "the target workflow",
  )}. The workflow creates delay, rework, or inconsistent decisions before work reaches the right owner. ${fallbackText(
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
${buildProblemStatement(discovery)}

## MVP behavior
${cleanGeneratedText(pilot.description)}

## Discovery evidence
${markdownList(
    discoveryEvidence.map(
      (item) => `${item.text}${item.quote ? ` (source: "${item.quote}")` : ""}`,
    ),
  )}

## Current workflow
${discovery.currentWorkflowSteps.map((step, index) => `${index + 1}. ${step}`).join("\n")}

## Target workflow and systems
${pilot.targetWorkflow}
${discovery.systemsInvolved.map((system) => `- ${system}`).join("\n")}

## Inputs and systems
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

## Explicit non-goals
${markdownList([pilot.notYet, discovery.constraints])}

## Edge cases and failure modes
${markdownList([...discovery.knownFailureModes, ...risks.map((risk) => `${risk.risk}: ${risk.signal}`)])}

## Build assumptions to validate
- V1 uses deterministic business rules and review workflows before deeper automation.
- Operators can see why the system suggested an action.
- The pilot writes enough activity data to measure adoption and quality.
- ${fallbackText(discovery.workflowOwner, "The workflow owner")} can review pilot feedback and metric movement weekly.
- Source-system access and representative records are available during discovery validation.
${assumptionsToValidate.map((claim) => `- ${claim.text}`).join("\n")}

## Open questions before build
- Which system is the source of truth for status and ownership?
- What case types are explicitly out of bounds for MVP?
- Who can approve the first controlled rollout cohort?
- Which metric will determine whether to expand at day 90?

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
  const pilotTitle = cleanOpportunityTitle(pilot.title, discovery);
  const bottlenecks = workflowBottlenecks.length
    ? workflowBottlenecks.map((item) => item.text)
    : buildBottlenecks(discovery);
  const supportingOpportunities = scoredOpportunities.filter(
    (opportunity) => opportunity.id !== pilot.id,
  );

  return `# Strategist Brief

## Recommendation
Recommended first pilot: ${pilotTitle}
Score: ${pilot.weightedScore}/100
Why this goes first: ${cleanGeneratedText(pilot.rationale)}
Required human review point: ${fallbackText(discovery.humanReviewPoint)}
What not to automate yet: ${cleanGeneratedText(pilot.notYet)}
Next strategist action: ${buildNextStrategistAction(discovery, pilot)}

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
${markdownList(
    discoveryEvidence.map(
      (item) => `${item.text}${item.quote ? ` (source: "${item.quote}")` : ""}`,
    ),
  )}

## Assumptions to validate
${markdownList(assumptionsToValidate.map((item) => item.text))}

## Top bottlenecks
${markdownList(bottlenecks)}

## Recommended pilot scope
Target workflow: ${cleanGeneratedText(pilot.targetWorkflow)}
MVP behavior: ${cleanGeneratedText(pilot.description)}
Non-goals: ${cleanGeneratedText(pilot.notYet)}

## Supporting opportunities considered
${supportingOpportunities.length
    ? supportingOpportunities
        .map(
          (opportunity) =>
            `- ${cleanOpportunityTitle(opportunity.title, discovery)}: ${opportunity.weightedScore}/100 (${opportunity.explanation})`,
        )
        .join("\n")
    : "- No additional opportunities were ranked above the recommended pilot."}

## Stakeholder map
${stakeholders
    .map(
      (stakeholder) =>
        `- ${cleanGeneratedText(stakeholder.role)}: ${cleanGeneratedText(stakeholder.concern)}. Alignment move: ${cleanGeneratedText(stakeholder.alignmentMove)}`,
    )
    .join("\n")}

## Adoption risk register
${risks
    .map(
      (risk) =>
        `- ${cleanGeneratedText(risk.risk)}: ${cleanGeneratedText(risk.mitigation)} (${cleanGeneratedText(risk.owner)})`,
    )
    .join("\n")}

## Value measurement plan
${metrics
    .map(
      (metric) =>
        `- ${cleanGeneratedText(metric.name)}: baseline ${cleanGeneratedText(metric.baseline)}; target ${cleanGeneratedText(metric.target)}; owner ${cleanGeneratedText(metric.owner)}; cadence ${cleanGeneratedText(metric.cadence)}; confidence ${metric.confidence}`,
    )
    .join("\n")}

## FDE handoff focus
Start with ${pilotTitle} as a reviewed workflow assistant. Prioritize traceability, exception handling, human approval, and measurable adoption over full autonomy.
`;
}
