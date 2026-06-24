import { SlidersHorizontal } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { TextareaField } from "@/components/ui/textarea-field";
import { TextField } from "@/components/ui/text-field";
import { linesFromList, splitLines } from "@/lib/format";
import type {
  AdoptionRisk,
  EvidenceBackedClaim,
  EvidenceItem,
  Opportunity,
  PilotKind,
  ScoringDimensionKey,
  ValueMetric,
  WorkbenchCase,
} from "@/lib/types";

type GeneratedOutputEditorProps = {
  workbenchCase: WorkbenchCase;
  onChange: (workbenchCase: WorkbenchCase) => void;
};

const pilotKinds: PilotKind[] = [
  "workflow",
  "measurement",
  "reporting",
  "knowledge",
  "follow-up",
];

const dimensionLabels: Array<[ScoringDimensionKey, string]> = [
  ["roiPotential", "ROI"],
  ["dataReadiness", "Data"],
  ["implementationEase", "Build ease"],
  ["adoptionEase", "Adoption ease"],
  ["strategicLeverage", "Leverage"],
  ["riskContainment", "Risk containment"],
  ["stakeholderUrgency", "Urgency"],
];

function evidenceFromLines(value: string, existing: EvidenceItem[]) {
  return splitLines(value).map((text, index) => ({
    id: existing[index]?.id ?? `evidence-${index + 1}`,
    text,
    source: existing[index]?.source ?? "notes",
    quote: existing[index]?.quote ?? "",
    confidence: existing[index]?.confidence ?? "medium",
  })) satisfies EvidenceItem[];
}

function claimsFromLines(value: string, existing: EvidenceBackedClaim[], prefix: string) {
  return splitLines(value).map((text, index) => ({
    id: existing[index]?.id ?? `${prefix}-${index + 1}`,
    text,
    evidenceIds: existing[index]?.evidenceIds ?? [],
    assumptionToValidate:
      existing[index]?.assumptionToValidate ??
      (prefix === "assumption" ? text : ""),
  })) satisfies EvidenceBackedClaim[];
}

function serializeRisks(risks: AdoptionRisk[]) {
  return risks
    .map((risk) =>
      [risk.risk, risk.signal, risk.mitigation, risk.owner].join(" | "),
    )
    .join("\n");
}

function parseRisks(value: string, existing: AdoptionRisk[]) {
  return splitLines(value).map((line, index) => {
    const [risk, signal, mitigation, owner] = line
      .split("|")
      .map((part) => part.trim());

    return {
      risk: risk || existing[index]?.risk || "Adoption risk to validate",
      signal: signal || existing[index]?.signal || "Signal not specified yet",
      mitigation:
        mitigation ||
        existing[index]?.mitigation ||
        "Define mitigation before rollout",
      owner: owner || existing[index]?.owner || "Workflow owner",
      evidenceIds: existing[index]?.evidenceIds,
      assumptionToValidate: existing[index]?.assumptionToValidate,
    } satisfies AdoptionRisk;
  });
}

function serializeMetrics(metrics: ValueMetric[]) {
  return metrics
    .map((metric) =>
      [
        metric.name,
        metric.baseline,
        metric.target,
        metric.owner,
        metric.cadence,
        metric.confidence,
      ].join(" | "),
    )
    .join("\n");
}

function parseMetrics(value: string, existing: ValueMetric[]) {
  return splitLines(value).map((line, index) => {
    const [name, baseline, target, owner, cadence, confidence] = line
      .split("|")
      .map((part) => part.trim());
    const confidenceValue =
      confidence === "low" || confidence === "medium" || confidence === "high"
        ? confidence
        : existing[index]?.confidence ?? "medium";

    return {
      name: name || existing[index]?.name || "Metric",
      baseline: baseline || existing[index]?.baseline || "Baseline TBD",
      target: target || existing[index]?.target || "Target TBD",
      owner: owner || existing[index]?.owner || "Workflow owner",
      cadence: cadence || existing[index]?.cadence || "Weekly",
      confidence: confidenceValue,
    } satisfies ValueMetric;
  });
}

function clampDimension(value: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 3;
  }

  return Math.min(5, Math.max(1, Math.round(parsed)));
}

export function GeneratedOutputEditor({
  workbenchCase,
  onChange,
}: GeneratedOutputEditorProps) {
  function updateCase(update: Partial<WorkbenchCase>) {
    onChange({ ...workbenchCase, ...update });
  }

  function updateOpportunity(index: number, update: Partial<Opportunity>) {
    const opportunities = workbenchCase.opportunities.map((opportunity, i) =>
      i === index ? { ...opportunity, ...update } : opportunity,
    );

    updateCase({ opportunities });
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Advanced: tune generated readout"
        title="Advanced recommendation details"
        description="Use this only when the recommendation needs deeper adjustment than the compact discovery review."
      />

      <div className="grid gap-5">
        <div className="grid gap-4 lg:grid-cols-3">
          <TextareaField
            label="Discovery evidence"
            value={linesFromList(
              workbenchCase.discoveryEvidence.map((item) => item.text),
            )}
            onChange={(value) =>
              updateCase({
                discoveryEvidence: evidenceFromLines(
                  value,
                  workbenchCase.discoveryEvidence,
                ),
              })
            }
            minRows={5}
            hint="One observation per line."
          />
          <TextareaField
            label="Bottlenecks"
            value={linesFromList(
              workbenchCase.workflowBottlenecks.map((item) => item.text),
            )}
            onChange={(value) =>
              updateCase({
                workflowBottlenecks: claimsFromLines(
                  value,
                  workbenchCase.workflowBottlenecks,
                  "bottleneck",
                ),
              })
            }
            minRows={5}
            hint="One bottleneck per line."
          />
          <TextareaField
            label="Assumptions to validate"
            value={linesFromList(
              workbenchCase.assumptionsToValidate.map((item) => item.text),
            )}
            onChange={(value) =>
              updateCase({
                assumptionsToValidate: claimsFromLines(
                  value,
                  workbenchCase.assumptionsToValidate,
                  "assumption",
                ),
              })
            }
            minRows={5}
            hint="One assumption per line."
          />
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-700" />
            <h3 className="text-base font-semibold text-slate-950">
              Opportunities and scores
            </h3>
          </div>
          <div className="grid gap-4">
            {workbenchCase.opportunities.map((opportunity, index) => (
              <div
                key={opportunity.id}
                className="rounded-md border border-slate-200 bg-slate-50 p-4"
              >
                <div className="grid gap-3 lg:grid-cols-[1fr_180px]">
                  <TextField
                    label="Opportunity"
                    value={opportunity.title}
                    onChange={(value) => updateOpportunity(index, { title: value })}
                  />
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      Opportunity type
                    </span>
                    <select
                      value={opportunity.pilotKind}
                      onChange={(event) =>
                        updateOpportunity(index, {
                          pilotKind: event.target.value as PilotKind,
                        })
                      }
                      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    >
                      {pilotKinds.map((kind) => (
                        <option key={kind} value={kind}>
                          {kind}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <TextareaField
                    label="Description"
                    value={opportunity.description}
                    onChange={(value) =>
                      updateOpportunity(index, { description: value })
                    }
                    minRows={3}
                  />
                  <TextareaField
                    label="Target workflow"
                    value={opportunity.targetWorkflow}
                    onChange={(value) =>
                      updateOpportunity(index, { targetWorkflow: value })
                    }
                    minRows={3}
                  />
                  <TextareaField
                    label="Why first / rationale"
                    value={opportunity.rationale}
                    onChange={(value) =>
                      updateOpportunity(index, { rationale: value })
                    }
                    minRows={3}
                  />
                  <TextareaField
                    label="What not to automate yet"
                    value={opportunity.notYet}
                    onChange={(value) =>
                      updateOpportunity(index, { notYet: value })
                    }
                    minRows={3}
                  />
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
                  {dimensionLabels.map(([key, label]) => (
                    <label key={key} className="block">
                      <span className="mb-1.5 block text-xs font-medium text-slate-600">
                        {label}
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={opportunity.dimensions[key]}
                        onChange={(event) =>
                          updateOpportunity(index, {
                            dimensions: {
                              ...opportunity.dimensions,
                              [key]: clampDimension(event.target.value),
                            },
                          })
                        }
                        className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <TextareaField
            label="Adoption risks"
            value={serializeRisks(workbenchCase.adoptionRisks)}
            onChange={(value) =>
              updateCase({
                adoptionRisks: parseRisks(value, workbenchCase.adoptionRisks),
              })
            }
            minRows={6}
            hint="Format: risk | signal | mitigation | owner"
          />
          <TextareaField
            label="Value metrics"
            value={serializeMetrics(workbenchCase.valueMetrics)}
            onChange={(value) =>
              updateCase({
                valueMetrics: parseMetrics(value, workbenchCase.valueMetrics),
              })
            }
            minRows={6}
            hint="Format: name | baseline | target | owner | cadence | confidence"
          />
        </div>
      </div>
    </div>
  );
}
