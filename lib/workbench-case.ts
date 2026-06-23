import { scenarios } from "@/data/scenarios";
import { buildBottlenecks } from "@/lib/briefs";
import type {
  EvidenceBackedClaim,
  EvidenceItem,
  ScenarioId,
  ScenarioPreset,
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

export function caseFromScenario(scenario: ScenarioPreset): WorkbenchCase {
  const discoveryEvidence = evidenceFromText(
    scenario.discoveryEvidence,
    "synthetic",
  );
  const evidenceIds = discoveryEvidence.map((item) => item.id);

  return {
    id: `demo-${scenario.id}`,
    scenarioId: scenario.id,
    label: scenario.label,
    summary: scenario.summary,
    mode: "demo",
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
  return caseFromScenarioId("insurer");
}

export function cloneWorkbenchCase(workbenchCase: WorkbenchCase): WorkbenchCase {
  return clone(workbenchCase);
}

export function claimTexts(claims: EvidenceBackedClaim[]) {
  return claims.map((claim) => claim.text);
}

export function evidenceTexts(items: EvidenceItem[]) {
  return items.map((item) => item.text);
}
