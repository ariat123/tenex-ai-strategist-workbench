export type ScenarioId = "insurer" | "healthcare" | "pe-ops" | "custom";

export type ReadinessLevel = "low" | "medium" | "high";

export type WorkbenchMode = "demo" | "ai-synthesis";

export type SectionId =
  | "overview"
  | "discovery"
  | "scoring"
  | "pilot"
  | "adoption"
  | "handoff"
  | "export";

export type EvidenceSource = "synthetic" | "notes" | "assumption";

export type PilotKind =
  | "workflow"
  | "measurement"
  | "reporting"
  | "knowledge"
  | "follow-up";

export type DiscoveryInput = {
  companyName: string;
  domain: string;
  workflowName: string;
  workflowOwner: string;
  baselineMetric: string;
  humanReviewPoint: string;
  executiveGoal: string;
  stakeholderNotes: string;
  operatorNotes: string;
  currentWorkflowSteps: string[];
  systemsInvolved: string[];
  estimatedVolume: string;
  estimatedTimeSpent: string;
  roughBusinessImpact: string;
  constraints: string;
  adoptionConcerns: string;
  teamReadiness: ReadinessLevel;
  dataAvailability: ReadinessLevel;
  knownFailureModes: string[];
};

export type ScoringDimensions = {
  roiPotential: number;
  dataReadiness: number;
  implementationEase: number;
  adoptionEase: number;
  strategicLeverage: number;
  riskContainment: number;
  stakeholderUrgency: number;
};

export type ScoringDimensionKey = keyof ScoringDimensions;

export type Opportunity = {
  id: string;
  title: string;
  description: string;
  targetWorkflow: string;
  pilotKind: PilotKind;
  evidenceIds?: string[];
  assumptionToValidate?: string;
  dimensions: ScoringDimensions;
  rationale: string;
  notYet: string;
};

export type ScoredOpportunity = Opportunity & {
  weightedScore: number;
  scoreBreakdown: Record<string, number>;
  explanation: string;
};

export type Stakeholder = {
  role: string;
  priority: "primary" | "supporting" | "informed";
  concern: string;
  alignmentMove: string;
};

export type AdoptionRisk = {
  risk: string;
  signal: string;
  mitigation: string;
  owner: string;
  evidenceIds?: string[];
  assumptionToValidate?: string;
};

export type ValueMetric = {
  name: string;
  baseline: string;
  target: string;
  owner: string;
  cadence: string;
  confidence: "low" | "medium" | "high";
};

export type EvidenceItem = {
  id: string;
  text: string;
  source: EvidenceSource;
  quote?: string;
  confidence: ReadinessLevel;
};

export type EvidenceBackedClaim = {
  id: string;
  text: string;
  evidenceIds: string[];
  assumptionToValidate?: string;
};

export type RolloutPhase = {
  phase: "30 days" | "60 days" | "90 days";
  focus: string;
  activities: string[];
};

export type ScenarioPreset = {
  id: ScenarioId;
  label: string;
  summary: string;
  discoveryEvidence: string[];
  assumptionsToValidate: string[];
  workflowBottlenecks?: string[];
  discovery: DiscoveryInput;
  opportunities: Opportunity[];
  stakeholders: Stakeholder[];
  adoptionRisks: AdoptionRisk[];
  valueMetrics: ValueMetric[];
};

export type WorkbenchCase = {
  id: string;
  scenarioId?: ScenarioId;
  label: string;
  summary: string;
  mode: WorkbenchMode;
  discovery: DiscoveryInput;
  workflowBottlenecks: EvidenceBackedClaim[];
  discoveryEvidence: EvidenceItem[];
  assumptionsToValidate: EvidenceBackedClaim[];
  opportunities: Opportunity[];
  stakeholders: Stakeholder[];
  adoptionRisks: AdoptionRisk[];
  valueMetrics: ValueMetric[];
  rawNotes?: string;
  synthesizedAt?: string;
};
