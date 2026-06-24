import { CheckCircle2 } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { TextareaField } from "@/components/ui/textarea-field";
import { TextField } from "@/components/ui/text-field";
import { linesFromList, splitLines } from "@/lib/format";
import { surfaces } from "@/lib/surfaces";
import type {
  DiscoveryInput,
  EvidenceBackedClaim,
  EvidenceItem,
  WorkbenchCase,
} from "@/lib/types";

type DiscoveryReviewProps = {
  workbenchCase: WorkbenchCase;
  onChange: (workbenchCase: WorkbenchCase) => void;
};

function evidenceFromLines(value: string, existing: EvidenceItem[]) {
  return splitLines(value).map((text, index) => ({
    id: existing[index]?.id ?? `evidence-review-${index + 1}`,
    text,
    source: existing[index]?.source ?? "notes",
    quote: existing[index]?.quote,
    confidence: existing[index]?.confidence ?? "medium",
  })) satisfies EvidenceItem[];
}

function claimsFromLines(
  value: string,
  existing: EvidenceBackedClaim[],
  prefix: string,
) {
  return splitLines(value).map((text, index) => ({
    id: existing[index]?.id ?? `${prefix}-review-${index + 1}`,
    text,
    evidenceIds: existing[index]?.evidenceIds ?? [],
    assumptionToValidate: existing[index]?.assumptionToValidate,
  })) satisfies EvidenceBackedClaim[];
}

export function DiscoveryReview({
  workbenchCase,
  onChange,
}: DiscoveryReviewProps) {
  const { discovery } = workbenchCase;
  const reviewInputClass =
    "bg-indigo-50/30 focus:border-indigo-500 focus:bg-white focus:ring-indigo-100";

  function updateDiscovery<K extends keyof DiscoveryInput>(
    key: K,
    value: DiscoveryInput[K],
  ) {
    onChange({
      ...workbenchCase,
      discovery: {
        ...discovery,
        [key]: value,
      },
    });
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <SectionHeader
        eyebrow="Post-synthesis review"
        title="Validate the strategist readout"
        description="Check the few facts that drive the recommendation before sharing or handing off."
      />

      <div className="grid gap-5">
        <div className={`${surfaces.inputWorkspace} grid gap-4 md:grid-cols-2`}>
          <TextField
            label="Client"
            value={discovery.companyName}
            onChange={(value) => updateDiscovery("companyName", value)}
            inputClassName={reviewInputClass}
          />
          <TextField
            label="Workflow"
            value={discovery.workflowName}
            onChange={(value) => updateDiscovery("workflowName", value)}
            inputClassName={reviewInputClass}
          />
          <TextField
            label="Workflow owner"
            value={discovery.workflowOwner}
            onChange={(value) => updateDiscovery("workflowOwner", value)}
            inputClassName={reviewInputClass}
          />
          <TextField
            label="Baseline metric"
            value={discovery.baselineMetric}
            onChange={(value) => updateDiscovery("baselineMetric", value)}
            inputClassName={reviewInputClass}
          />
        </div>

        <div className={surfaces.inputWorkspace}>
          <TextareaField
            label="Executive question / mandate"
            value={discovery.executiveMandate}
            onChange={(value) => updateDiscovery("executiveMandate", value)}
            minRows={2}
            hint="What is the leadership-level question this discovery should answer?"
            placeholder="Why have prior AI pilots not changed this workflow, and what first workflow should we ship?"
            textareaClassName={reviewInputClass}
          />
        </div>

        <div className={surfaces.inputWorkspace}>
          <TextareaField
            label="Required human review point"
            value={discovery.humanReviewPoint}
            onChange={(value) => updateDiscovery("humanReviewPoint", value)}
            minRows={3}
            textareaClassName={reviewInputClass}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <TextareaField
            label="Discovery evidence"
            value={linesFromList(
              workbenchCase.discoveryEvidence.map((item) => item.text),
            )}
            onChange={(value) =>
              onChange({
                ...workbenchCase,
                discoveryEvidence: evidenceFromLines(
                  value,
                  workbenchCase.discoveryEvidence,
                ),
              })
            }
            minRows={5}
            hint="One observation per line."
            textareaClassName={reviewInputClass}
          />
          <TextareaField
            label="Top bottlenecks"
            value={linesFromList(
              workbenchCase.workflowBottlenecks.map((item) => item.text),
            )}
            onChange={(value) =>
              onChange({
                ...workbenchCase,
                workflowBottlenecks: claimsFromLines(
                  value,
                  workbenchCase.workflowBottlenecks,
                  "bottleneck",
                ),
              })
            }
            minRows={5}
            hint="One bottleneck per line."
            textareaClassName={reviewInputClass}
          />
          <TextareaField
            label="Assumptions to validate"
            value={linesFromList(
              workbenchCase.assumptionsToValidate.map((item) => item.text),
            )}
            onChange={(value) =>
              onChange({
                ...workbenchCase,
                assumptionsToValidate: claimsFromLines(
                  value,
                  workbenchCase.assumptionsToValidate,
                  "assumption",
                ),
              })
            }
            minRows={5}
            hint="One assumption per line."
            textareaClassName="border-amber-200 bg-amber-50/40 focus:border-amber-500 focus:bg-white focus:ring-amber-100"
          />
        </div>

        <div className={surfaces.guidanceSurface}>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-slate-700" />
            <h3 className="text-sm font-semibold text-slate-950">
              Review before sharing
            </h3>
          </div>
          <div className="grid gap-2 text-sm leading-6 text-slate-700 md:grid-cols-2">
            <p>Validate the workflow owner.</p>
            <p>Validate the baseline metric.</p>
            <p>Confirm the human review point.</p>
            <p>Check bottlenecks and assumptions against the notes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
