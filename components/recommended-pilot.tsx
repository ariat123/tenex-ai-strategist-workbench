import { ClipboardCheck, ShieldAlert, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScoreChip } from "@/components/ui/score-chip";
import { SectionHeader } from "@/components/ui/section-header";
import { buildBottlenecks } from "@/lib/briefs";
import type {
  DiscoveryInput,
  EvidenceBackedClaim,
  ScoredOpportunity,
} from "@/lib/types";

type RecommendedPilotProps = {
  discovery: DiscoveryInput;
  pilot: ScoredOpportunity;
  workflowBottlenecks: EvidenceBackedClaim[];
};

export function RecommendedPilot({
  discovery,
  pilot,
  workflowBottlenecks,
}: RecommendedPilotProps) {
  const discoveryChecks = workflowBottlenecks.length
    ? workflowBottlenecks.map((item) => item.text)
    : buildBottlenecks(discovery);

  return (
    <div className="grid gap-4">
      <Card>
        <SectionHeader
          eyebrow="Recommended first pilot"
          title={pilot.title}
          description={pilot.description}
          action={<ScoreChip score={pilot.weightedScore} showBand />}
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-slate-700" />
              <h3 className="text-sm font-semibold text-slate-950">Why first</h3>
            </div>
            <p className="text-sm leading-6 text-slate-700">{pilot.rationale}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-slate-700" />
              <h3 className="text-sm font-semibold text-slate-950">
                Target workflow
              </h3>
            </div>
            <p className="text-sm leading-6 text-slate-700">
              {pilot.targetWorkflow}
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-slate-700" />
              <h3 className="text-sm font-semibold text-slate-950">
                Not yet
              </h3>
            </div>
            <p className="text-sm leading-6 text-slate-700">{pilot.notYet}</p>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader
          title="Pilot boundaries"
          description="Keep v1 reviewed, measurable, and narrow before expanding automation."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">MVP scope</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              <li>Reviewed recommendations for eligible pilot work.</li>
              <li>Source-linked explanations for each suggested action.</li>
              <li>
                {discovery.humanReviewPoint}
              </li>
              <li>Override reasons and exception categories captured as data.</li>
              <li>
                Baseline tracked by {discovery.workflowOwner}:{" "}
                {discovery.baselineMetric}.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Discovery checks before build
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {discoveryChecks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
