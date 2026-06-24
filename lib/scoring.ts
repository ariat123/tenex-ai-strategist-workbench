import type {
  DiscoveryInput,
  Opportunity,
  ScoredOpportunity,
  ScoringDimensionKey,
} from "@/lib/types";

type ScoringRule = {
  key: ScoringDimensionKey;
  label: string;
  weight: number;
  description: string;
};

export const scoringModel: ScoringRule[] = [
  {
    key: "roiPotential",
    label: "ROI potential",
    weight: 0.22,
    description: "Business value if the workflow improves.",
  },
  {
    key: "dataReadiness",
    label: "Data readiness",
    weight: 0.16,
    description: "Availability and quality of usable inputs.",
  },
  {
    key: "implementationEase",
    label: "Implementation ease",
    weight: 0.16,
    description: "5 means easier to implement.",
  },
  {
    key: "adoptionEase",
    label: "Adoption ease",
    weight: 0.14,
    description: "5 means easier for users to adopt.",
  },
  {
    key: "strategicLeverage",
    label: "Strategic leverage",
    weight: 0.14,
    description: "Reuse potential across teams or workflows.",
  },
  {
    key: "riskContainment",
    label: "Risk containment",
    weight: 0.08,
    description: "5 means mistakes are contained or reviewable.",
  },
  {
    key: "stakeholderUrgency",
    label: "Stakeholder urgency",
    weight: 0.1,
    description: "Strength of executive or operator pull.",
  },
];

function clampScore(value: number) {
  return Math.min(5, Math.max(1, value));
}

function dimensionSignal(value: number) {
  if (value >= 4) return "strong";
  if (value === 3) return "moderate";
  return "weak";
}

export function displayDimensionValue(value: number) {
  return clampScore(value);
}

export function scoreOpportunity(opportunity: Opportunity): ScoredOpportunity {
  const scoreBreakdown: Record<string, number> = {};
  let rawScore = 0;

  for (const rule of scoringModel) {
    const dimensionValue = clampScore(opportunity.dimensions[rule.key]);
    const effectiveValue = displayDimensionValue(dimensionValue);
    rawScore += effectiveValue * rule.weight;
    scoreBreakdown[rule.key] = Math.round((effectiveValue / 5) * rule.weight * 100);
  }

  const weightedScore = Math.round((rawScore / 5) * 100);
  const implementationEase = displayDimensionValue(
    opportunity.dimensions.implementationEase,
  );
  const adoptionEase = displayDimensionValue(
    opportunity.dimensions.adoptionEase,
  );
  const riskContainment = displayDimensionValue(
    opportunity.dimensions.riskContainment,
  );
  const explanation = [
    `${dimensionSignal(opportunity.dimensions.roiPotential)} ROI`,
    `${dimensionSignal(opportunity.dimensions.dataReadiness)} data readiness`,
    `${dimensionSignal(implementationEase)} implementation ease`,
    `${dimensionSignal(adoptionEase)} adoption ease`,
    `${dimensionSignal(riskContainment)} risk containment`,
  ].join(", ");

  return {
    ...opportunity,
    weightedScore,
    scoreBreakdown,
    explanation,
  };
}

export function scoreOpportunities(opportunities: Opportunity[]) {
  return opportunities
    .map(scoreOpportunity)
    .sort((a, b) => b.weightedScore - a.weightedScore);
}

function isReportingContext(discovery: DiscoveryInput) {
  const text = `${discovery.domain} ${discovery.workflowName} ${discovery.executiveGoal}`;

  return /portfolio|reporting|kpi|dashboard|visibility|board/i.test(text);
}

function isWorkflowIntervention(opportunity: ScoredOpportunity) {
  return opportunity.pilotKind === "workflow";
}

export function selectRecommendedPilot(
  opportunities: ScoredOpportunity[],
  discovery: DiscoveryInput,
) {
  const winner = opportunities[0];

  if (!winner) {
    return undefined;
  }

  if (!isReportingContext(discovery)) {
    const workflow = opportunities.find(isWorkflowIntervention);

    if (workflow && winner.pilotKind !== "workflow") {
      return workflow;
    }
  }

  return winner;
}

export function scoreBand(score: number) {
  if (score >= 80) return "Strong first pilot";
  if (score >= 65) return "Good with caveats";
  if (score >= 50) return "Useful, not first";
  return "Defer or narrow";
}

export function dimensionLabel(key: string) {
  return scoringModel.find((rule) => rule.key === key)?.label ?? key;
}

export function topDimensionDrivers(opportunity: ScoredOpportunity) {
  return scoringModel
    .map((rule) => ({
      label: rule.label,
      value: displayDimensionValue(opportunity.dimensions[rule.key]),
      contribution: opportunity.scoreBreakdown[rule.key] ?? 0,
    }))
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 3);
}

export function caveatForOpportunity(opportunity: ScoredOpportunity) {
  const adoptionEase = displayDimensionValue(
    opportunity.dimensions.adoptionEase,
  );
  const riskContainment = displayDimensionValue(
    opportunity.dimensions.riskContainment,
  );

  if (riskContainment <= 3) {
    return "Keep human review explicit before customer, clinical, financial, or system-of-record actions.";
  }

  if (adoptionEase <= 3) {
    return "Validate frontline trust and override behavior before expanding beyond the pilot group.";
  }

  return "Confirm representative exceptions before broadening scope.";
}
