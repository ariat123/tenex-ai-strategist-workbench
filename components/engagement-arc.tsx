import { ArrowRight } from "lucide-react";

const engagementSteps = [
  "Executive mandate",
  "Discovery",
  "Pilot decision",
  "Build handoff",
  "Adoption",
  "Value proof",
  "Reusable learning",
];

export function EngagementArc() {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-300 bg-slate-50/80 px-4 py-2">
      <div className="flex min-w-max items-center gap-2 text-xs">
        <span className="mr-1 font-semibold uppercase tracking-wide text-slate-400">
          Engagement arc
        </span>
        {engagementSteps.map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <span
              className={
                index === 0
                  ? "rounded-full border border-indigo-100 bg-white px-2.5 py-1 font-semibold text-indigo-700"
                  : "rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 font-medium text-slate-500"
              }
            >
              {step}
            </span>
            {index < engagementSteps.length - 1 ? (
              <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
