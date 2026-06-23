import { UsersRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { buildRolloutPlan } from "@/lib/briefs";
import type {
  AdoptionRisk,
  DiscoveryInput,
  EvidenceBackedClaim,
  ScoredOpportunity,
  Stakeholder,
} from "@/lib/types";

type AdoptionPlanProps = {
  discovery: DiscoveryInput;
  pilot: ScoredOpportunity;
  stakeholders: Stakeholder[];
  risks: AdoptionRisk[];
  assumptionsToValidate: EvidenceBackedClaim[];
};

export function AdoptionPlan({
  discovery,
  pilot,
  stakeholders,
  risks,
  assumptionsToValidate,
}: AdoptionPlanProps) {
  const rollout = buildRolloutPlan(discovery, pilot);

  return (
    <div className="grid gap-4">
      <Card>
        <SectionHeader
          eyebrow="Adoption & rollout"
          title="Stakeholder and adoption path"
          description={`Identify stakeholders, adoption risks, assumptions, and the 30/60/90 path to usage. The pilot needs ${discovery.workflowOwner} to own feedback, baseline movement, and the required review path.`}
        />
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Pilot owner
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-950">
              {discovery.workflowOwner}
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Baseline
            </p>
            <p className="mt-1 text-sm leading-5 text-slate-700">
              {discovery.baselineMetric}
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Review point
            </p>
            <p className="mt-1 text-sm leading-5 text-slate-700">
              {discovery.humanReviewPoint}
            </p>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {stakeholders.map((stakeholder) => (
            <div
              key={stakeholder.role}
              className="rounded-md border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <UsersRound className="h-4 w-4 text-slate-600" />
                  <h3 className="text-sm font-semibold text-slate-950">
                    {stakeholder.role}
                  </h3>
                </div>
                <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600">
                  {stakeholder.priority}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Concern: {stakeholder.concern}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Alignment move: {stakeholder.alignmentMove}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader
          title="Assumptions to validate"
          description="Rollout and adoption planning should expose what is not proven yet."
        />
        <div className="grid gap-3 md:grid-cols-3">
          {assumptionsToValidate.slice(0, 6).map((assumption) => (
            <div
              key={assumption.id}
              className="rounded-md border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-sm leading-6 text-slate-700">
                {assumption.text}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader
          title="Rollout and adoption risk register"
          description="Adoption risk is implementation scope because the workflow only matters if people use it."
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 pr-4 font-semibold">Risk</th>
                <th className="py-3 pr-4 font-semibold">Signal</th>
                <th className="py-3 pr-4 font-semibold">Mitigation</th>
                <th className="py-3 pr-4 font-semibold">Owner</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((risk) => (
                <tr key={risk.risk} className="border-b border-slate-100 last:border-0">
                  <td className="py-4 pr-4 font-medium text-slate-950">{risk.risk}</td>
                  <td className="py-4 pr-4 leading-6 text-slate-700">{risk.signal}</td>
                  <td className="py-4 pr-4 leading-6 text-slate-700">
                    {risk.mitigation}
                  </td>
                  <td className="py-4 pr-4 text-slate-700">{risk.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <SectionHeader
          title="30/60/90 rollout"
          description="From discovery validation to controlled rollout and expansion."
        />
        <div className="grid gap-3 lg:grid-cols-3">
          {rollout.map((phase) => (
            <div
              key={phase.phase}
              className="rounded-md border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-xs font-semibold uppercase text-slate-500">
                {phase.phase}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-slate-950">
                {phase.focus}
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {phase.activities.map((activity) => (
                  <li key={activity}>{activity}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
