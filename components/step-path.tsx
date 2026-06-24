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
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step, index) => {
          const active = step.id === activeSection;
          const available = step.id === "discovery" || hasStructuredReadout;

          return (
            <div key={step.id} className="flex items-center gap-2">
              <button
                type="button"
                disabled={!available}
                onClick={() => onSelect(step.id)}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed ${
                  active
                    ? "bg-slate-950 text-white"
                    : available
                      ? "text-slate-700 hover:bg-slate-100"
                      : "text-slate-400"
                }`}
              >
                {available && step.id !== "discovery" ? (
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
