"use client";

import { ArrowRight, ClipboardList, ListChecks } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { TextareaField } from "@/components/ui/textarea-field";
import { TextField } from "@/components/ui/text-field";
import { surfaces } from "@/lib/surfaces";

type GuidedDiscoveryProps = {
  onUseAsNotes: (notes: string) => void;
  executiveMandate: string;
  onExecutiveMandateChange: (value: string) => void;
};

type GuideContext = {
  companyName: string;
  industry: string;
  workflowArea: string;
  stakeholderRole: string;
  businessGoal: string;
  optionalContext: string;
};

type GuideGroup = {
  id: string;
  title: string;
  listenFor: string;
  questions: string[];
};

const businessGoals = [
  "Reduce manual work",
  "Speed up cycle time",
  "Improve quality or consistency",
  "Reduce operational or compliance risk",
  "Improve customer or patient experience",
  "Increase revenue or conversion",
  "Identify first AI pilot opportunities",
  "Prepare build handoff",
];

const defaultContext: GuideContext = {
  companyName: "",
  industry: "",
  workflowArea: "",
  stakeholderRole: "",
  businessGoal: "Identify first AI pilot opportunities",
  optionalContext: "",
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function contextTerms(context: GuideContext) {
  const industry = normalize(context.industry);
  const workflow = normalize(context.workflowArea);
  const workflowLabel = context.workflowArea.trim() || "the target workflow";

  if (
    industry.includes("health") ||
    workflow.includes("referral") ||
    workflow.includes("patient") ||
    workflow.includes("schedul")
  ) {
    return {
      workflowLabel,
      systems:
        "EHR, scheduling, referral intake, patient communication, and document systems",
      missingInfo: "missing documentation, referral quality, authorization status, or patient context",
      riskBoundary:
        "clinical review, patient communication, scheduling changes, and system-of-record updates",
      adoption:
        "scheduler trust, clinical review boundaries, and handoff clarity",
      firstPilot:
        "referral intake, scheduling triage, completeness checking, or reviewed patient follow-up",
    };
  }

  if (
    industry.includes("insurance") ||
    workflow.includes("claim") ||
    workflow.includes("underwriting") ||
    workflow.includes("broker")
  ) {
    return {
      workflowLabel,
      systems:
        "claims, policy, document, broker/customer communication, and routing systems",
      missingInfo:
        "missing attachments, policy context, coverage details, duplicate requests, or routing ambiguity",
      riskBoundary:
        "coverage decisions, customer-facing communication, payment actions, and system-of-record updates",
      adoption:
        "adjuster trust, override reasons, broker/customer service boundaries, and escalation paths",
      firstPilot:
        "claims intake triage, routing assistance, completeness checking, or reviewed follow-up drafting",
    };
  }

  if (
    industry.includes("private equity") ||
    industry.includes("pe") ||
    workflow.includes("portfolio") ||
    workflow.includes("kpi") ||
    workflow.includes("diligence")
  ) {
    return {
      workflowLabel,
      systems:
        "portfolio reporting, finance, CRM, spreadsheet trackers, diligence rooms, and initiative trackers",
      missingInfo:
        "late KPI submissions, unclear owners, inconsistent definitions, or missing initiative updates",
      riskBoundary:
        "financial interpretation, board-facing recommendations, and portfolio-company commitments",
      adoption:
        "operating partner trust, portfolio-company burden, and weekly review cadence",
      firstPilot:
        "KPI variance follow-up, initiative owner routing, diligence support, or reviewed action drafting",
    };
  }

  return {
    workflowLabel,
    systems:
      "the primary system of record, shared intake channel, communication tools, and manual tracking sheet",
    missingInfo:
      "missing context, unclear ownership, duplicate work, incomplete records, or manual rework",
    riskBoundary:
      "customer-facing actions, financial decisions, compliance-sensitive decisions, and system-of-record updates",
    adoption:
      "operator trust, manager visibility, override behavior, and extra-click concerns",
    firstPilot:
      "intake triage, routing assistance, completeness checking, knowledge retrieval, or reviewed follow-up automation",
  };
}

function buildGuide(context: GuideContext): GuideGroup[] {
  const terms = contextTerms(context);
  const goal = context.businessGoal || "Identify first AI pilot opportunities";
  const stakeholder = context.stakeholderRole.trim() || "this stakeholder";

  return [
    {
      id: "business-goal",
      title: "Business goal and success metric",
      listenFor:
        "A concrete business outcome, baseline, target, owner, and expansion decision metric.",
      questions: [
        `What does ${goal.toLowerCase()} mean for ${terms.workflowLabel}?`,
        "Which metric would tell us this workflow pilot is worth expanding?",
        "What is the current baseline, even if it is rough?",
        `Who owns the metric and who would decide whether ${terms.workflowLabel} improves enough to continue?`,
      ],
    },
    {
      id: "current-workflow",
      title: "Current workflow",
      listenFor:
        "Steps, handoffs, queue ownership, informal workarounds, and where judgment enters the process.",
      questions: [
        `Walk me through ${terms.workflowLabel} from intake to completion.`,
        `Where does ${stakeholder} spend the most time or wait the longest?`,
        "Which steps are standard, and which depend on individual judgment?",
        "Where does ownership become unclear or move across teams?",
      ],
    },
    {
      id: "systems-data",
      title: "Systems and data",
      listenFor:
        "Source of truth, fragmented records, access limits, write-back constraints, and data quality issues.",
      questions: [
        `Which systems does the team use today, including ${terms.systems}?`,
        "What is the source of truth for status, ownership, and next action?",
        `What information is often missing or unreliable, such as ${terms.missingInfo}?`,
        "Where would the pilot need read-only access versus write-back approval?",
      ],
    },
    {
      id: "bottlenecks-rework",
      title: "Bottlenecks and rework",
      listenFor:
        "Delay, avoidable handoffs, repeated checks, rework loops, backlog, and quality issues.",
      questions: [
        "Where do items most often get stuck, reworked, or escalated?",
        "What does the team check manually that a system could help prepare or flag?",
        "Which bottleneck creates the most visible business pain?",
        "What work is repeated across cases even though the judgment is similar?",
      ],
    },
    {
      id: "exceptions-edge-cases",
      title: "Exceptions and edge cases",
      listenFor:
        "Unusual cases, high-risk cases, override reasons, ambiguous records, and escalation triggers.",
      questions: [
        `Which ${terms.workflowLabel} cases should never be handled automatically in v1?`,
        "What exception types require a senior reviewer or specialist?",
        "What are the most common failure modes or bad recommendations to avoid?",
        "What override reasons would be useful to capture during a pilot?",
      ],
    },
    {
      id: "human-review-risk",
      title: "Human review and risk boundaries",
      listenFor:
        "Actions that require approval, reviewable recommendations, reversible decisions, and compliance boundaries.",
      questions: [
        `Which actions must stay human reviewed, especially ${terms.riskBoundary}?`,
        "Where can AI safely recommend, draft, or route without taking final action?",
        "What explanation would a reviewer need before trusting a suggestion?",
        "Which decisions are reversible, and which require stronger control?",
      ],
    },
    {
      id: "stakeholders-adoption",
      title: "Stakeholders and adoption",
      listenFor:
        "Sponsor pull, operator trust, workflow owner accountability, training needs, and adoption blockers.",
      questions: [
        `Who needs to trust this pilot for ${terms.workflowLabel} to become part of daily work?`,
        `What adoption concerns should we expect around ${terms.adoption}?`,
        "What would make operators feel helped rather than monitored?",
        "Who should review pilot feedback and override patterns each week?",
      ],
    },
    {
      id: "first-pilot-fit",
      title: "First pilot fit",
      listenFor:
        "A bounded workflow intervention with clear inputs, human review, measurable value, and low rollout friction.",
      questions: [
        `Which narrow part of ${terms.workflowLabel} would be safe to pilot first?`,
        `Would ${terms.firstPilot} remove enough pain without over-automating?`,
        "What should explicitly stay out of scope for the first version?",
        "What would make this pilot credible within 30 to 90 days?",
      ],
    },
    {
      id: "fde-build-readiness",
      title: "Build readiness",
      listenFor:
        "Inputs, outputs, integrations, review workflow, permissions, edge cases, and MVP assumptions.",
      questions: [
        "What inputs would an FDE need to build a useful first version?",
        "What should the pilot output: recommendation, route, draft, checklist, or queue?",
        "Which systems need integration, and which can be handled manually for MVP?",
        "What open questions must be answered before build starts?",
      ],
    },
  ];
}

function buildNotesFromGuide(
  context: GuideContext,
  guide: GuideGroup[],
  answers: Record<string, string>,
  executiveMandate: string,
) {
  const lines = [
    "Guided discovery context",
    `Executive question / mandate: ${executiveMandate || "Not specified"}`,
    `Company: ${context.companyName || "Not specified"}`,
    `Industry: ${context.industry || "Not specified"}`,
    `Workflow area: ${context.workflowArea || "Not specified"}`,
    `Stakeholder role interviewed: ${context.stakeholderRole || "Not specified"}`,
    `Business goal: ${context.businessGoal}`,
    context.optionalContext
      ? `Additional context: ${context.optionalContext}`
      : "Additional context: Not specified",
    "",
    "Captured discovery answers",
  ];

  guide.forEach((group) => {
    lines.push("", group.title, "Questions asked:");
    group.questions.forEach((question) => {
      lines.push(`- ${question}`);
    });
    lines.push("Answers captured:");
    lines.push(answers[group.id]?.trim() || "No answer captured yet.");
  });

  return lines.join("\n");
}

export function GuidedDiscovery({
  onUseAsNotes,
  executiveMandate,
  onExecutiveMandateChange,
}: GuidedDiscoveryProps) {
  const [context, setContext] = useState<GuideContext>(defaultContext);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const guide = useMemo(() => buildGuide(context), [context]);

  function updateContext<K extends keyof GuideContext>(
    key: K,
    value: GuideContext[K],
  ) {
    setContext((current) => ({ ...current, [key]: value }));
  }

  function updateAnswer(groupId: string, value: string) {
    setAnswers((current) => ({ ...current, [groupId]: value }));
  }

  return (
    <Card className={surfaces.aiSurface}>
      <SectionHeader
        eyebrow="Guided discovery"
        title="Prepare a focused discovery guide"
        description="Optional pre-call support. Prepare sharper questions and capture answers, then move them into the same notes flow."
        action={
          <Button
            variant="primary"
            onClick={() =>
              onUseAsNotes(
                buildNotesFromGuide(context, guide, answers, executiveMandate),
              )
            }
            className="whitespace-nowrap"
          >
            <ArrowRight className="h-4 w-4" />
            Use answers as discovery notes
          </Button>
        }
      />

      <div className="grid gap-5">
        <div className="rounded-md border border-violet-200 bg-white/80 p-3">
          <TextareaField
            label="Executive question / mandate"
            value={executiveMandate}
            onChange={onExecutiveMandateChange}
            minRows={2}
            hint="What is the leadership-level question this discovery should answer?"
            placeholder="Why have prior AI pilots not changed this workflow, and what first workflow should we ship?"
            textareaClassName="bg-violet-50/30 focus:border-violet-500 focus:bg-white focus:ring-violet-100"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TextField
            label="Company name"
            value={context.companyName}
            onChange={(value) => updateContext("companyName", value)}
            placeholder="Acme Health"
            inputClassName="bg-white/80 focus:border-violet-400 focus:ring-violet-100"
          />
          <TextField
            label="Industry"
            value={context.industry}
            onChange={(value) => updateContext("industry", value)}
            placeholder="Healthcare, insurance, PE..."
            inputClassName="bg-white/80 focus:border-violet-400 focus:ring-violet-100"
          />
          <TextField
            label="Workflow area"
            value={context.workflowArea}
            onChange={(value) => updateContext("workflowArea", value)}
            placeholder="Referral intake, claims, onboarding..."
            inputClassName="bg-white/80 focus:border-violet-400 focus:ring-violet-100"
          />
          <TextField
            label="Stakeholder role being interviewed"
            value={context.stakeholderRole}
            onChange={(value) => updateContext("stakeholderRole", value)}
            placeholder="COO, ops lead, operator..."
            inputClassName="bg-white/80 focus:border-violet-400 focus:ring-violet-100"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_1fr]">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Business goal
            </span>
            <select
              value={context.businessGoal}
              onChange={(event) =>
                updateContext("businessGoal", event.target.value)
              }
              className="h-10 w-full rounded-md border border-slate-300 bg-white/80 px-3 text-sm text-slate-950 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
              {businessGoals.map((goal) => (
                <option key={goal} value={goal}>
                  {goal}
                </option>
              ))}
            </select>
          </label>
          <TextareaField
            label="Optional context"
            value={context.optionalContext}
            onChange={(value) => updateContext("optionalContext", value)}
            minRows={3}
            hint="Add any known constraints, meeting context, or existing hypotheses."
            textareaClassName="bg-white/80 focus:border-violet-400 focus:ring-violet-100"
          />
        </div>

        <div className="rounded-md border border-violet-200 bg-white/80 p-4">
          <div className="flex items-start gap-3">
            <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-violet-700" />
            <div>
              <h3 className="text-sm font-semibold text-slate-950">
                Capture answers loosely
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                These prompts are a discovery aid, not a script. Capture useful
                fragments, quotes, metrics, objections, and open questions. The
                answers become raw notes for the existing synthesis flow.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {guide.map((group) => (
            <section
              key={group.id}
              className={surfaces.aiSubcard}
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-violet-700" />
                    <h3 className="text-sm font-semibold text-slate-950">
                      {group.title}
                    </h3>
                  </div>
                  <ul className="space-y-2 text-sm leading-6 text-slate-700">
                    {group.questions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                  <p className="mt-3 rounded-md border border-violet-100 bg-violet-50/60 p-3 text-xs leading-5 text-slate-600">
                    <span className="font-semibold text-violet-800">
                      Listen for:
                    </span>{" "}
                    {group.listenFor}
                  </p>
                </div>
                <TextareaField
                  label="Captured answers"
                  value={answers[group.id] ?? ""}
                  onChange={(value) => updateAnswer(group.id, value)}
                  minRows={8}
                  hint="Messy notes are fine. Capture fragments, quotes, metrics, and open questions."
                  textareaClassName="border-violet-200 bg-violet-50/30 px-4 py-3 focus:border-violet-500 focus:bg-white focus:ring-violet-100"
                />
              </div>
            </section>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={() =>
              onUseAsNotes(
                buildNotesFromGuide(context, guide, answers, executiveMandate),
              )
            }
          >
            <ArrowRight className="h-4 w-4" />
            Use answers as discovery notes
          </Button>
        </div>
      </div>
    </Card>
  );
}
