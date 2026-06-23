import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { SectionHeader } from "@/components/ui/section-header";
import { buildFdeHandoffBrief } from "@/lib/briefs";
import { fallbackText, sentenceList } from "@/lib/format";
import type {
  AdoptionRisk,
  DiscoveryInput,
  EvidenceBackedClaim,
  EvidenceItem,
  ScoredOpportunity,
  ValueMetric,
} from "@/lib/types";

type FdeHandoffBriefProps = {
  discovery: DiscoveryInput;
  pilot: ScoredOpportunity;
  risks: AdoptionRisk[];
  metrics: ValueMetric[];
  assumptionsToValidate: EvidenceBackedClaim[];
  discoveryEvidence: EvidenceItem[];
};

export function FdeHandoffBrief({
  discovery,
  pilot,
  risks,
  metrics,
  assumptionsToValidate,
  discoveryEvidence,
}: FdeHandoffBriefProps) {
  const brief = buildFdeHandoffBrief(
    discovery,
    pilot,
    risks,
    metrics,
    assumptionsToValidate,
    discoveryEvidence,
  );
  const sections = [
    {
      title: "Problem statement",
      body: [
        `${fallbackText(discovery.companyName, "The client")} needs a focused pilot for ${fallbackText(
          discovery.workflowName,
          "the target workflow",
        )}. The current process creates delay, inconsistent triage, and limited operating visibility.`,
        `Owner: ${fallbackText(discovery.workflowOwner)}. Baseline: ${fallbackText(
          discovery.baselineMetric,
        )}.`,
      ],
    },
    {
      title: "Discovery evidence",
      body: discoveryEvidence.map((item) =>
        item.quote ? `${item.text} Source: ${item.quote}` : item.text,
      ),
    },
    {
      title: "Current workflow",
      body: discovery.currentWorkflowSteps,
      ordered: true,
    },
    {
      title: "Target workflow",
      body: [pilot.targetWorkflow],
    },
    {
      title: "Systems involved",
      body: discovery.systemsInvolved,
    },
    {
      title: "Inputs and data sources",
      body: [
        "Discovery notes from stakeholders and operators",
        `Workflow records from ${sentenceList(
          discovery.systemsInvolved,
          "source systems",
        )}`,
        "Exception and failure-mode examples",
        "Baseline KPI extracts for volume, time, quality, and adoption",
      ],
    },
    {
      title: "Outputs",
      body: [
        "Prioritized work item or recommendation",
        "Explanation visible to the human reviewer",
        "Routed next action or draft follow-up",
        "Metric events for adoption and quality tracking",
      ],
    },
    {
      title: "Human review points",
      body: [
        discovery.humanReviewPoint,
        "First-pass routing decisions",
        "High-risk or ambiguous records",
        "Customer, patient, broker, or portfolio-company-facing outputs",
        "Any case matching known failure modes",
      ],
    },
    {
      title: "Edge cases",
      body: discovery.knownFailureModes,
    },
    {
      title: "Failure modes",
      body: risks.map((risk) => `${risk.risk}: ${risk.signal}`),
    },
    {
      title: "Build assumptions",
      body: [
        "V1 uses deterministic business rules and review workflows before deeper automation.",
        "Operators can see why the system suggested an action.",
        "The pilot writes enough activity data to measure adoption and quality.",
        `${fallbackText(
          discovery.workflowOwner,
          "The workflow owner",
        )} can review pilot feedback and metric movement weekly.`,
        "Source-system access and sample records are available during discovery validation.",
        ...assumptionsToValidate.map((assumption) => assumption.text),
      ],
    },
    {
      title: "Open questions",
      body: [
        "Which system is the source of truth for status and ownership?",
        "What case types are explicitly out of bounds for MVP?",
        "Who can approve the first controlled rollout cohort?",
        "Which metric will determine whether to expand at day 90?",
      ],
    },
    {
      title: "MVP scope",
      body: [pilot.description],
    },
    {
      title: "What not to build yet",
      body: [pilot.notYet],
    },
    {
      title: "Success metrics",
      body: metrics.map(
        (metric) => `${metric.name}: ${metric.baseline} -> ${metric.target}`,
      ),
    },
  ];

  return (
    <Card>
      <SectionHeader
        eyebrow="Implementation handoff"
        title="FDE handoff brief"
        description="Implementation brief for MVP scoping and build handoff."
        action={<CopyButton text={brief} label="Copy handoff" />}
      />
      <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-md border border-slate-200 bg-white p-4"
          >
            <h3 className="text-sm font-semibold text-slate-950">
              {section.title}
            </h3>
            {section.ordered ? (
              <ol className="mt-2 space-y-1 text-sm leading-6 text-slate-700">
                {section.body.map((item, index) => (
                  <li key={`${section.title}-${item}`} className="flex gap-2">
                    <span className="text-xs font-semibold text-slate-500">
                      {index + 1}.
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            ) : section.body.length === 1 ? (
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {section.body[0]}
              </p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-700">
                {section.body.map((item) => (
                  <li key={`${section.title}-${item}`}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </Card>
  );
}
