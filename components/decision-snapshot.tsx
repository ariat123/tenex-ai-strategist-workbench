import { ArrowRight, ClipboardCheck, Gauge, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { ScoreChip } from "@/components/ui/score-chip";
import { SectionHeader } from "@/components/ui/section-header";
import { buildBottlenecks, buildStrategistBrief } from "@/lib/briefs";
import { fallbackText, readinessScore } from "@/lib/format";
import type {
  AdoptionRisk,
  DiscoveryInput,
  EvidenceBackedClaim,
  EvidenceItem,
  ScoredOpportunity,
  Stakeholder,
  ValueMetric,
} from "@/lib/types";

type DecisionSnapshotProps = {
  discovery: DiscoveryInput;
  opportunities: ScoredOpportunity[];
  recommendedPilot: ScoredOpportunity;
  stakeholders: Stakeholder[];
  risks: AdoptionRisk[];
  metrics: ValueMetric[];
  discoveryEvidence: EvidenceItem[];
  assumptionsToValidate: EvidenceBackedClaim[];
  workflowBottlenecks: EvidenceBackedClaim[];
};

export function DecisionSnapshot({
  discovery,
  opportunities,
  recommendedPilot,
  stakeholders,
  risks,
  metrics,
  discoveryEvidence,
  assumptionsToValidate,
  workflowBottlenecks,
}: DecisionSnapshotProps) {
  const pilot = recommendedPilot;
  const brief = buildStrategistBrief(
    discovery,
    opportunities,
    stakeholders,
    risks,
    metrics,
    discoveryEvidence,
    assumptionsToValidate,
    workflowBottlenecks,
    recommendedPilot,
  );
  const bottlenecks = workflowBottlenecks.length
    ? workflowBottlenecks.slice(0, 3).map((item) => item.text)
    : buildBottlenecks(discovery).slice(0, 3);
  const nextAction = `Validate ${fallbackText(
    discovery.baselineMetric,
    "the baseline metric",
  )} with ${fallbackText(
    discovery.workflowOwner,
    "the workflow owner",
  )}, then lock MVP scope and review rules for ${pilot.title}.`;

  return (
    <Card className="border-slate-300">
      <SectionHeader
        eyebrow="Decision snapshot"
        title="Strategist conclusion"
        description="Recommendation, risk boundary, and next action up front."
        action={<CopyButton text={brief} label="Copy strategist brief" />}
      />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Client / workflow
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {fallbackText(discovery.companyName)}
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-600">
                {fallbackText(discovery.workflowName)}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-slate-600" />
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Readiness score
                </p>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {readinessScore(discovery)}/100
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Team readiness plus data availability.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Workflow owner
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {fallbackText(discovery.workflowOwner)}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Baseline: {fallbackText(discovery.baselineMetric)}
              </p>
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Recommended first pilot
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-950">
                  {pilot.title}
                </h3>
              </div>
              <ScoreChip score={pilot.weightedScore} showBand />
            </div>
            <p className="text-sm leading-6 text-slate-700">{pilot.rationale}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-700" />
                <h3 className="text-sm font-semibold text-slate-950">
                  What not to automate yet
                </h3>
              </div>
              <p className="text-sm leading-6 text-slate-700">{pilot.notYet}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-slate-700" />
                <h3 className="text-sm font-semibold text-slate-950">
                  Required human review
                </h3>
              </div>
              <p className="text-sm leading-6 text-slate-700">
                {fallbackText(discovery.humanReviewPoint)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-950">
              Top bottlenecks
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {bottlenecks.map((bottleneck) => (
                <li key={bottleneck}>{bottleneck}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-950">
              Assumptions to validate
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {assumptionsToValidate.map((assumption) => (
                <li key={assumption.id}>{assumption.text}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-slate-900 bg-slate-950 p-4 text-white">
            <div className="mb-2 flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              <h3 className="text-sm font-semibold">
                Next recommended strategist action
              </h3>
            </div>
            <p className="text-sm leading-6 text-slate-100">{nextAction}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
