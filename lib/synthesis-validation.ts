import { scoreOpportunities } from "@/lib/scoring";
import { caseFromScenarioId } from "@/lib/workbench-case";
import type {
  AdoptionRisk,
  DiscoveryInput,
  EvidenceBackedClaim,
  EvidenceItem,
  Opportunity,
  PilotKind,
  ReadinessLevel,
  ScoringDimensions,
  Stakeholder,
  ValueMetric,
  WorkbenchCase,
} from "@/lib/types";

type SynthesisResult = {
  workbenchCase: WorkbenchCase;
  warnings: string[];
};

const readinessLevels: ReadinessLevel[] = ["low", "medium", "high"];
const pilotKinds: PilotKind[] = [
  "workflow",
  "measurement",
  "reporting",
  "knowledge",
  "follow-up",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function stringArray(value: unknown, fallback: string[], limit = 8) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);

  return items.length ? items : fallback;
}

function readiness(value: unknown, fallback: ReadinessLevel): ReadinessLevel {
  return readinessLevels.includes(value as ReadinessLevel)
    ? (value as ReadinessLevel)
    : fallback;
}

function confidence(value: unknown): ReadinessLevel {
  return readiness(value, "medium");
}

function pilotKind(value: unknown): PilotKind {
  return pilotKinds.includes(value as PilotKind) ? (value as PilotKind) : "workflow";
}

function score(value: unknown, fallback = 3) {
  const number = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(5, Math.max(1, Math.round(number)));
}

function normalizeId(value: unknown, fallback: string) {
  const id = text(value, fallback)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

  return id || fallback;
}

function normalizeEvidence(value: unknown, index: number): EvidenceItem {
  const item = isRecord(value) ? value : {};
  const quote = typeof item.quote === "string" ? item.quote.trim() : "";

  return {
    id: normalizeId(item.id, `evidence-${index + 1}`),
    text: text(item.text, "Discovery observation to validate."),
    source: quote ? "notes" : "assumption",
    quote,
    confidence: confidence(item.confidence),
  };
}

function normalizeClaim(
  value: unknown,
  index: number,
  prefix: string,
  fallbackText: string,
): EvidenceBackedClaim {
  const item = isRecord(value) ? value : {};
  const evidenceIds = stringArray(item.evidenceIds, [], 3);
  const assumptionToValidate = text(item.assumptionToValidate, "");
  const claimText = text(item.text, fallbackText);

  return {
    id: normalizeId(item.id, `${prefix}-${index + 1}`),
    text: claimText,
    evidenceIds,
    assumptionToValidate:
      evidenceIds.length || assumptionToValidate
        ? assumptionToValidate
        : `Validate: ${claimText}`,
  };
}

function normalizeDimensions(value: unknown): ScoringDimensions {
  const item = isRecord(value) ? value : {};

  return {
    roiPotential: score(item.roiPotential, 3),
    dataReadiness: score(item.dataReadiness, 3),
    implementationEase: score(item.implementationEase, 3),
    adoptionEase: score(item.adoptionEase, 3),
    strategicLeverage: score(item.strategicLeverage, 3),
    riskContainment: score(item.riskContainment, 3),
    stakeholderUrgency: score(item.stakeholderUrgency, 3),
  };
}

function normalizeDiscovery(value: unknown, fallback: DiscoveryInput): DiscoveryInput {
  const item = isRecord(value) ? value : {};

  return {
    companyName: text(item.companyName, fallback.companyName),
    domain: text(item.domain, fallback.domain),
    workflowName: text(item.workflowName, fallback.workflowName),
    workflowOwner: text(item.workflowOwner, fallback.workflowOwner),
    baselineMetric: text(item.baselineMetric, fallback.baselineMetric),
    humanReviewPoint: text(item.humanReviewPoint, fallback.humanReviewPoint),
    executiveGoal: text(item.executiveGoal, fallback.executiveGoal),
    stakeholderNotes: text(item.stakeholderNotes, fallback.stakeholderNotes),
    operatorNotes: text(item.operatorNotes, fallback.operatorNotes),
    currentWorkflowSteps: stringArray(
      item.currentWorkflowSteps,
      fallback.currentWorkflowSteps,
    ),
    systemsInvolved: stringArray(item.systemsInvolved, fallback.systemsInvolved),
    estimatedVolume: text(item.estimatedVolume, fallback.estimatedVolume),
    estimatedTimeSpent: text(
      item.estimatedTimeSpent,
      fallback.estimatedTimeSpent,
    ),
    roughBusinessImpact: text(
      item.roughBusinessImpact,
      fallback.roughBusinessImpact,
    ),
    constraints: text(item.constraints, fallback.constraints),
    adoptionConcerns: text(item.adoptionConcerns, fallback.adoptionConcerns),
    teamReadiness: readiness(item.teamReadiness, fallback.teamReadiness),
    dataAvailability: readiness(
      item.dataAvailability,
      fallback.dataAvailability,
    ),
    knownFailureModes: stringArray(
      item.knownFailureModes,
      fallback.knownFailureModes,
    ),
  };
}

function normalizeOpportunity(
  value: unknown,
  index: number,
  fallback: Opportunity,
): Opportunity {
  const item = isRecord(value) ? value : {};
  const evidenceIds = stringArray(item.evidenceIds, [], 3);
  const assumptionToValidate = text(item.assumptionToValidate, "");
  const title = text(item.title, fallback.title);

  return {
    id: normalizeId(item.id, `opportunity-${index + 1}`),
    title,
    description: text(item.description, fallback.description),
    targetWorkflow: text(item.targetWorkflow, fallback.targetWorkflow),
    pilotKind: pilotKind(item.pilotKind),
    evidenceIds,
    assumptionToValidate:
      evidenceIds.length || assumptionToValidate
        ? assumptionToValidate
        : `Validate evidence for ${title}.`,
    dimensions: normalizeDimensions(item.dimensions),
    rationale: text(item.rationale, fallback.rationale),
    notYet: text(item.notYet, fallback.notYet),
  };
}

function normalizeStakeholder(
  value: unknown,
  index: number,
  fallback: Stakeholder,
): Stakeholder {
  const item = isRecord(value) ? value : {};
  const priorities: Stakeholder["priority"][] = [
    "primary",
    "supporting",
    "informed",
  ];
  const priority = priorities.includes(item.priority as Stakeholder["priority"])
    ? (item.priority as Stakeholder["priority"])
    : fallback.priority;

  return {
    role: text(item.role, fallback.role || `Stakeholder ${index + 1}`),
    priority,
    concern: text(item.concern, fallback.concern),
    alignmentMove: text(item.alignmentMove, fallback.alignmentMove),
  };
}

function normalizeRisk(
  value: unknown,
  index: number,
  fallback: AdoptionRisk,
): AdoptionRisk {
  const item = isRecord(value) ? value : {};
  const evidenceIds = stringArray(item.evidenceIds, [], 3);
  const risk = text(item.risk, fallback.risk);
  const assumptionToValidate = text(item.assumptionToValidate, "");

  return {
    risk,
    signal: text(item.signal, fallback.signal),
    mitigation: text(item.mitigation, fallback.mitigation),
    owner: text(item.owner, fallback.owner),
    evidenceIds,
    assumptionToValidate:
      evidenceIds.length || assumptionToValidate
        ? assumptionToValidate
        : `Validate adoption risk: ${risk}.`,
  };
}

function normalizeMetric(
  value: unknown,
  index: number,
  fallback: ValueMetric,
): ValueMetric {
  const item = isRecord(value) ? value : {};

  return {
    name: text(item.name, fallback.name || `Metric ${index + 1}`),
    baseline: text(item.baseline, fallback.baseline),
    target: text(item.target, fallback.target),
    owner: text(item.owner, fallback.owner),
    cadence: text(item.cadence, fallback.cadence),
    confidence: confidence(item.confidence),
  };
}

function normalizeArray<T>(
  value: unknown,
  fallback: T[],
  mapper: (item: unknown, index: number, fallbackItem: T) => T,
  limit: number,
) {
  const source = Array.isArray(value) && value.length ? value : fallback;

  return source
    .slice(0, limit)
    .map((item, index) => mapper(item, index, fallback[index % fallback.length]));
}

export function normalizeSynthesisDraft(
  draft: unknown,
  rawNotes: string,
  currentDiscovery?: DiscoveryInput,
): SynthesisResult {
  if (!isRecord(draft)) {
    throw new Error("Model output was not an object.");
  }

  const fallbackCase = caseFromScenarioId("custom");
  const fallbackDiscovery = currentDiscovery ?? fallbackCase.discovery;
  const warnings = stringArray(draft.warnings, [], 5);
  const discovery = normalizeDiscovery(draft.discovery, fallbackDiscovery);
  const discoveryEvidence = normalizeArray(
    draft.discoveryEvidence,
    fallbackCase.discoveryEvidence,
    normalizeEvidence,
    6,
  );
  const fallbackEvidenceIds = discoveryEvidence.map((item) => item.id);
  const workflowBottlenecks = normalizeArray(
    draft.workflowBottlenecks,
    fallbackCase.workflowBottlenecks,
    (item, index, fallback) =>
      normalizeClaim(item, index, "bottleneck", fallback.text),
    5,
  );
  const assumptionsToValidate = normalizeArray(
    draft.assumptionsToValidate,
    fallbackCase.assumptionsToValidate,
    (item, index, fallback) =>
      normalizeClaim(item, index, "assumption", fallback.text),
    6,
  );
  let opportunities = normalizeArray(
    draft.opportunities,
    fallbackCase.opportunities,
    normalizeOpportunity,
    4,
  );

  if (!opportunities.some((opportunity) => opportunity.pilotKind === "workflow")) {
    opportunities = [fallbackCase.opportunities[0], ...opportunities].slice(0, 4);
    warnings.push("No workflow intervention was extracted, so a reviewed intake pilot was added.");
  }

  const scored = scoreOpportunities(opportunities);
  const top = scored[0];
  const workflow = scored.find((opportunity) => opportunity.pilotKind === "workflow");

  if (
    top &&
    workflow &&
    (top.pilotKind === "measurement" || top.pilotKind === "reporting")
  ) {
    warnings.push(
      "A measurement/reporting layer scored highly; the workbench will still prefer a workflow pilot unless the context is explicitly reporting-led.",
    );
  }

  return {
    workbenchCase: {
      id: `ai-${Date.now()}`,
      label: text(draft.label, discovery.companyName || "Synthesized discovery"),
      summary: text(
        draft.summary,
        "AI-synthesized strategist workbench from pasted discovery notes.",
      ),
      mode: "ai-synthesis",
      discovery,
      workflowBottlenecks: workflowBottlenecks.map((claim, index) => ({
        ...claim,
        evidenceIds: claim.evidenceIds.length
          ? claim.evidenceIds
          : fallbackEvidenceIds.slice(index, index + 1),
      })),
      discoveryEvidence,
      assumptionsToValidate,
      opportunities,
      stakeholders: normalizeArray(
        draft.stakeholders,
        fallbackCase.stakeholders,
        normalizeStakeholder,
        5,
      ),
      adoptionRisks: normalizeArray(
        draft.adoptionRisks,
        fallbackCase.adoptionRisks,
        normalizeRisk,
        5,
      ),
      valueMetrics: normalizeArray(
        draft.valueMetrics,
        fallbackCase.valueMetrics,
        normalizeMetric,
        6,
      ),
      rawNotes,
      synthesizedAt: new Date().toISOString(),
    },
    warnings,
  };
}
