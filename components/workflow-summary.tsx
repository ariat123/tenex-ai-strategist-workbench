import { AlertTriangle, CheckCircle2, Workflow } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { buildBottlenecks, buildCurrentStateSummary } from "@/lib/briefs";
import { levelLabel } from "@/lib/format";
import type {
  DiscoveryInput,
  EvidenceBackedClaim,
  EvidenceItem,
} from "@/lib/types";

type WorkflowSummaryProps = {
  discovery: DiscoveryInput;
  discoveryEvidence: EvidenceItem[];
  workflowBottlenecks: EvidenceBackedClaim[];
};

export function WorkflowSummary({
  discovery,
  discoveryEvidence,
  workflowBottlenecks,
}: WorkflowSummaryProps) {
  const bottlenecks = workflowBottlenecks.length
    ? workflowBottlenecks.map((item) => item.text)
    : buildBottlenecks(discovery);

  return (
    <div className="grid gap-4">
      <Card>
        <SectionHeader
          eyebrow="Current state"
          title="Workflow diagnosis"
          description={buildCurrentStateSummary(discovery)}
        />
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Owner</p>
            <p className="mt-1 text-sm font-medium text-slate-950">
              {discovery.workflowOwner}
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Baseline
            </p>
            <p className="mt-1 text-sm font-medium text-slate-950">
              {discovery.baselineMetric}
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Readiness
            </p>
            <p className="mt-1 text-sm font-medium text-slate-950">
              Team {levelLabel(discovery.teamReadiness)}, data{" "}
              {levelLabel(discovery.dataAvailability)}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-slate-700" />
            <h3 className="text-base font-semibold text-slate-950">
              Discovery evidence
            </h3>
          </div>
          <ul className="space-y-3">
            {discoveryEvidence.map((evidence) => (
              <li key={evidence.id} className="text-sm leading-6 text-slate-700">
                <span>{evidence.text}</span>
                <span className="ml-2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-medium uppercase text-slate-500">
                  {evidence.source}
                </span>
                {evidence.quote ? (
                  <span className="mt-1 block text-xs text-slate-500">
                    Source: {evidence.quote}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Workflow className="h-4 w-4 text-slate-700" />
            <h3 className="text-base font-semibold text-slate-950">
              Workflow steps
            </h3>
          </div>
          <ol className="space-y-3">
            {discovery.currentWorkflowSteps.map((step, index) => (
              <li key={`${step}-${index}`} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
                  {index + 1}
                </span>
                <span className="leading-6 text-slate-700">{step}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-slate-700" />
            <h3 className="text-base font-semibold text-slate-950">
              Bottlenecks to validate
            </h3>
          </div>
          <ul className="space-y-3">
            {bottlenecks.map((bottleneck) => (
              <li key={bottleneck} className="flex gap-3 text-sm">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
                <span className="leading-6 text-slate-700">{bottleneck}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
