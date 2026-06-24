import { scenarios } from "@/data/scenarios";
import { buildBottlenecks } from "@/lib/briefs";
import type {
  DiscoveryInput,
  EvidenceBackedClaim,
  EvidenceItem,
  ScenarioId,
  ScenarioExample,
  WorkbenchCase,
} from "@/lib/types";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function evidenceFromText(
  items: string[],
  source: EvidenceItem["source"],
): EvidenceItem[] {
  return items.map((text, index) => ({
    id: `${source}-${index + 1}-${slug(text) || "evidence"}`,
    text,
    source,
    confidence: source === "assumption" ? "medium" : "high",
  }));
}

export function claimsFromText(
  items: string[],
  prefix: string,
  evidenceIds: string[] = [],
): EvidenceBackedClaim[] {
  return items.map((text, index) => ({
    id: `${prefix}-${index + 1}-${slug(text) || "claim"}`,
    text,
    evidenceIds: evidenceIds.length ? [evidenceIds[index % evidenceIds.length]] : [],
  }));
}

const blankDiscovery: DiscoveryInput = {
  companyName: "",
  domain: "",
  workflowName: "",
  workflowOwner: "",
  baselineMetric: "",
  humanReviewPoint: "",
  executiveMandate: "",
  executiveGoal: "",
  stakeholderNotes: "",
  operatorNotes: "",
  currentWorkflowSteps: [],
  systemsInvolved: [],
  estimatedVolume: "",
  estimatedTimeSpent: "",
  roughBusinessImpact: "",
  constraints: "",
  adoptionConcerns: "",
  teamReadiness: "medium",
  dataAvailability: "medium",
  knownFailureModes: [],
};

export function caseFromScenario(scenario: ScenarioExample): WorkbenchCase {
  const discoveryEvidence = evidenceFromText(
    scenario.discoveryEvidence,
    "synthetic",
  );
  const evidenceIds = discoveryEvidence.map((item) => item.id);

  return {
    id: `example-${scenario.id}`,
    scenarioId: scenario.id,
    label: scenario.label,
    summary: scenario.summary,
    mode: "example",
    discovery: clone(scenario.discovery),
    workflowBottlenecks: claimsFromText(
      scenario.workflowBottlenecks ?? buildBottlenecks(scenario.discovery).slice(0, 4),
      "bottleneck",
      evidenceIds,
    ),
    discoveryEvidence,
    assumptionsToValidate: claimsFromText(
      scenario.assumptionsToValidate,
      "assumption",
      evidenceIds,
    ).map((claim) => ({
      ...claim,
      assumptionToValidate: claim.text,
    })),
    opportunities: clone(scenario.opportunities),
    stakeholders: clone(scenario.stakeholders),
    adoptionRisks: clone(scenario.adoptionRisks),
    valueMetrics: clone(scenario.valueMetrics),
  };
}

export function caseFromScenarioId(id: ScenarioId): WorkbenchCase {
  const scenario =
    scenarios.find((candidate) => candidate.id === id) ?? scenarios[0];

  return caseFromScenario(scenario);
}

export function defaultWorkbenchCase() {
  const baseCase = caseFromScenarioId("custom");

  return {
    ...baseCase,
    id: "live-discovery",
    scenarioId: undefined,
    label: "Live discovery case",
    summary: "Paste discovery notes to structure a strategist readout.",
    mode: "live",
    discovery: clone(blankDiscovery),
    workflowBottlenecks: [],
    discoveryEvidence: [],
    assumptionsToValidate: [],
    opportunities: [],
    stakeholders: [],
    adoptionRisks: [],
    valueMetrics: [],
    rawNotes: "",
    synthesizedAt: undefined,
  } satisfies WorkbenchCase;
}

export function cloneWorkbenchCase(workbenchCase: WorkbenchCase): WorkbenchCase {
  return clone(workbenchCase);
}

export function hydrateWorkbenchCase(workbenchCase: WorkbenchCase): WorkbenchCase {
  return {
    ...workbenchCase,
    discovery: {
      ...blankDiscovery,
      ...workbenchCase.discovery,
    },
  };
}

export function claimTexts(claims: EvidenceBackedClaim[]) {
  return claims.map((claim) => claim.text);
}

export function evidenceTexts(items: EvidenceItem[]) {
  return items.map((item) => item.text);
}
