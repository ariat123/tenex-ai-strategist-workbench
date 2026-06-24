import { CheckCircle2 } from "lucide-react";
import type { SectionId } from "@/lib/types";

type StepPathProps = {
  activeSection: SectionId;
  hasStructuredReadout: boolean;
  onSelect: (section: SectionId) => void;
};

const steps: Array<{ id: SectionId; label: string; shortLabel: string }> = [
  { id: "discovery", label: "Discovery", shortLabel: "Discovery" },
  { id: "overview", label: "Decision", shortLabel: "Decision" },
  { id: "pilot", label: "Pilot", shortLabel: "Pilot" },
  { id: "handoff", label: "Handoff", shortLabel: "Handoff" },
  { id: "export", label: "Brief", shortLabel: "Brief" },
];

export function StepPath({
  activeSection,
  hasStructuredReadout,
  onSelect,
}: StepPathProps) {
  const activeIndex = steps.findIndex((step) => step.id === activeSection);

  return (
    <div className="rounded-md border border-indigo-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step, index) => {
          const active = step.id === activeSection;
          const available = step.id === "discovery" || hasStructuredReadout;
          const completed =
            hasStructuredReadout && activeIndex >= 0 && index < activeIndex;

          return (
            <div key={step.id} className="flex items-center gap-2">
              <button
                type="button"
                disabled={!available}
                onClick={() => onSelect(step.id)}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : completed
                      ? "bg-emerald-50 text-emerald-700"
                    : available
                      ? "text-slate-600 hover:bg-indigo-50 hover:text-indigo-800"
                      : "text-slate-400"
                }`}
              >
                {completed ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : null}
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.shortLabel}</span>
              </button>
              {index < steps.length - 1 ? (
                <span className="text-xs font-semibold text-slate-300">→</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
