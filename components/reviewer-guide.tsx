import { BookOpen, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ReviewerGuideProps = {
  open: boolean;
  onClose: () => void;
};

const fastPathSteps = [
  "Open Discovery.",
  "Enter the access code if one was provided.",
  "Add the executive question or mandate.",
  "Paste messy discovery notes from a client conversation.",
  "Click Structure discovery notes.",
  "Review Decision snapshot, First pilot, Build handoff, and Final brief.",
];

const guidedPathSteps = [
  "Choose Prepare discovery guide.",
  "Add company, industry, workflow area, stakeholder, and goal.",
  "Use the generated question guide to capture messy answers.",
  "Click Use answers as discovery notes.",
  "Structure the notes into the same strategist readout.",
];

const reviewChecks = [
  "Does the recommendation identify a bounded first workflow pilot?",
  "Does it preserve human review where risk is high?",
  "Does it say what not to automate yet?",
  "Does the build handoff give an FDE enough context to start scoping?",
  "Does the adoption plan surface stakeholder risks and value proof?",
  "Does the final brief read like something a strategist could share or refine?",
];

const suggestedTestCase = `Executive question / mandate:
Why have prior automation pilots failed to reduce claims intake cycle time, and what first AI workflow should we ship without giving AI authority over coverage, liability, settlement, or payout decisions?

Discovery notes:
Client: Regional insurance carrier

Executive context:
The VP of Claims says the company has tried automation pilots before, but most created more review work instead of reducing cycle time. Leadership wants a practical first AI workflow that improves claims intake speed and adjuster capacity without letting AI make coverage, liability, settlement, or payout decisions.

Current workflow:
New claims arrive through email, broker portal, and claim portal. Intake specialists read the claim, check policy status in Guidewire, review broker and customer notes in Salesforce, look for attachments in the document management system, check the internal policy database, then route the claim to an adjuster queue.

Bottlenecks:
Information is spread across Guidewire, Salesforce, Outlook, broker portal, document storage, and the policy database. Simple claims take 6 to 10 minutes to triage. Complex claims take 12 to 18 minutes. Around 22 percent of claims require follow up for missing photos, loss descriptions, policy details, or broker context.

Stakeholders:
VP of Claims wants faster cycle time and better adjuster capacity.
Claims Operations Manager wants fewer reroutes, cleaner intake quality, and better visibility into why claims get reassigned.
Compliance Lead requires source references, audit trail, and human approval before any customer or broker facing action.
Adjusters do not trust black box routing. They want to see why a claim is routed a certain way and need an easy way to override the suggestion.

Systems:
Guidewire
Salesforce
Outlook shared inbox
Broker portal
Document management system
Internal policy database
Slack for manager escalation

Business impact:
Delayed routing creates adjuster idle time, duplicate broker follow up, slower cycle time, and avoidable escalation volume. Managers do not have consistent visibility into why claims are rerouted or why missing information is discovered late.

Constraints:
No AI coverage decisions.
No AI liability decisions.
No AI settlement or payout decisions.
No customer or broker messages without human review.
No direct writeback into Guidewire in version one.
Every recommendation needs source references.
Compliance wants an event trail showing inputs, recommendation, reviewer, approval, override reason, and final action.

Adoption concerns:
Intake specialists will ignore the tool if it adds more review work.
Adjusters will reject routing suggestions if explanations are vague.
Compliance will block expansion if recommendations are not auditable.
Managers want override reasons tracked before rollout expands.

Known failure modes:
Claim routed to wrong severity queue.
Missing attachments not requested before assignment.
Duplicate broker follow up.
High risk claim bypasses lead review.
Policy status is misread.
AI suggests a customer facing action without enough evidence.
The assistant recommends action when the relevant document is missing or stale.

Required human review:
An intake specialist approves the AI suggested claim type, missing information checklist, routing recommendation, and any broker follow up draft before adjuster assignment or broker outreach.

What not to automate yet:
Do not auto assign high risk claims.
Do not determine coverage, liability, settlement, or payout.
Do not send customer or broker messages without human approval.
Do not write directly into Guidewire in version one.
Do not override intake specialist judgment.

Possible first pilot:
A claims intake triage and missing information assistant that reviews incoming claim context, flags missing information, suggests routing, explains the source evidence behind the suggestion, and keeps the intake specialist in control.

Value proof after pilot:
Track average triage time, missing information follow up rate, routing override rate, compliance audit exceptions, and intake specialist usage. Expand only if the pilot reduces review time without increasing reroutes, overrides, or audit risk.

Reusable learning to capture:
Track override reasons and missing information categories so the next intake or routing workflow starts with better exception rules and clearer source requirements.`;

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="grid gap-2 text-sm leading-6 text-slate-700">
      {items.map((item, index) => (
        <li key={item} className="flex gap-3">
          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
            {index + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function ReviewerGuide({ open, onClose }: ReviewerGuideProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reviewer-guide-title"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-md border border-slate-200 bg-white shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              <BookOpen className="h-4 w-4" />
              Reviewer guide
            </div>
            <h2
              id="reviewer-guide-title"
              className="mt-2 text-2xl font-semibold text-slate-950"
            >
              How to use PilotPath
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              PilotPath is a candidate-built workbench for the AI Strategist
              role. It supports one high-leverage slice of the engagement:
              turning an executive mandate and messy discovery notes into a
              first workflow pilot, build handoff, adoption path, value proof,
              and final brief.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close guide"
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-4 p-5">
          <section className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-base font-semibold text-slate-950">
              What this is
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              This is not meant to model the entire Tenex engagement lifecycle.
              It focuses on the discovery-to-first-pilot motion: understanding
              how work happens, identifying a bounded AI workflow, defining
              human review boundaries, preparing an FDE-ready handoff, and
              outlining how adoption and value should be measured.
            </p>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-md border border-indigo-200 bg-indigo-50/50 p-4">
              <h3 className="text-base font-semibold text-slate-950">
                Fast path
              </h3>
              <div className="mt-3">
                <NumberedList items={fastPathSteps} />
              </div>
              <p className="mt-3 rounded-md border border-indigo-100 bg-white/70 p-3 text-xs leading-5 text-indigo-900">
                If you received an access code, enter it in the Access code
                field on Discovery.
              </p>
            </section>

            <section className="rounded-md border border-violet-200 bg-violet-50/40 p-4">
              <h3 className="text-base font-semibold text-slate-950">
                Guided discovery path
              </h3>
              <div className="mt-3">
                <NumberedList items={guidedPathSteps} />
              </div>
            </section>
          </div>

          <section className="rounded-md border border-slate-200 bg-white p-4">
            <h3 className="text-base font-semibold text-slate-950">
              What to look for
            </h3>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700 md:grid-cols-2">
              {reviewChecks.map((check) => (
                <li key={check} className="flex gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </section>

          <details className="rounded-md border border-slate-200 bg-slate-50">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-950 marker:text-slate-500">
              Suggested test case
              <span className="mt-1 block text-sm font-normal leading-6 text-slate-600">
                Regional insurance carrier claims scenario for a full
                Discovery-to-brief run.
              </span>
            </summary>
            <pre className="max-h-96 overflow-auto border-t border-slate-200 bg-white p-4 text-xs leading-5 text-slate-800 whitespace-pre-wrap">
              {suggestedTestCase}
            </pre>
          </details>

          <section className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
            <h3 className="text-base font-semibold text-emerald-950">
              Expected good output
            </h3>
            <p className="mt-2 text-sm leading-6 text-emerald-950">
              A good synthesis should recommend a claims intake triage and
              missing information assistant, keep the intake specialist in
              control, make coverage/liability/settlement/payout decisions
              explicit non-goals, and produce a build handoff with systems,
              inputs, outputs, human review, failure modes, open questions, and
              success metrics.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
