import { Building2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ScenarioExample, ScenarioId } from "@/lib/types";
import { cn } from "@/lib/format";

type ScenarioSelectorProps = {
  scenarios: ScenarioExample[];
  selectedId?: ScenarioId;
  onSelect: (id: ScenarioId) => void;
};

export function ScenarioSelector({
  scenarios,
  selectedId,
  onSelect,
}: ScenarioSelectorProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {scenarios.map((scenario) => {
        const selected = scenario.id === selectedId;

        return (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onSelect(scenario.id)}
            className="text-left"
          >
            <Card
              as="div"
              className={cn(
                "h-full p-4 transition-colors hover:border-indigo-200",
                selected ? "border-indigo-300 bg-indigo-50/50 ring-2 ring-indigo-100" : "",
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-700">
                  <Building2 className="h-4 w-4" />
                </span>
                {selected ? (
                  <CheckCircle2 className="h-5 w-5 text-indigo-700" />
                ) : null}
              </div>
              <h3 className="text-sm font-semibold text-slate-950">
                {scenario.label}
              </h3>
              {scenario.id === "custom" ? (
                <span className="mt-2 inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
                  Editable outline
                </span>
              ) : null}
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {scenario.summary}
              </p>
              <div className="mt-4 text-xs text-slate-500">
                {scenario.discovery.workflowName}
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
