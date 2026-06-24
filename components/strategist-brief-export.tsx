import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { SectionHeader } from "@/components/ui/section-header";
import { buildStrategistBrief } from "@/lib/briefs";
import { surfaces } from "@/lib/surfaces";
import type {
  AdoptionRisk,
  DiscoveryInput,
  EvidenceBackedClaim,
  EvidenceItem,
  ScoredOpportunity,
  Stakeholder,
  ValueMetric,
} from "@/lib/types";

type StrategistBriefExportProps = {
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

export function StrategistBriefExport({
  discovery,
  opportunities,
  recommendedPilot,
  stakeholders,
  risks,
  metrics,
  discoveryEvidence,
  assumptionsToValidate,
  workflowBottlenecks,
}: StrategistBriefExportProps) {
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

  return (
    <Card>
      <SectionHeader
        eyebrow="Final brief"
        title="Final strategist brief"
        description="One copyable artifact combining the recommendation, evidence, scoring, rollout, build handoff, and value plan."
        action={<CopyButton text={brief} label="Copy brief" variant="primary" />}
      />
      <div className={`${surfaces.inputWorkspace} p-3`}>
        <textarea
          readOnly
          value={brief}
          className="min-h-[640px] w-full rounded-md border border-indigo-100 bg-white/90 p-4 text-sm leading-6 text-slate-800 outline-none"
        />
      </div>
    </Card>
  );
}
