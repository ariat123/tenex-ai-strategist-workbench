import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { confidenceClass } from "@/lib/format";
import type { ValueMetric } from "@/lib/types";

type ValueMeasurementPlanProps = {
  metrics: ValueMetric[];
};

export function ValueMeasurementPlan({ metrics }: ValueMeasurementPlanProps) {
  return (
    <Card>
      <SectionHeader
        eyebrow="Measurement"
        title="Value measurement plan"
        description="The pilot should capture value, adoption, quality, and operational movement from the start."
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <th className="py-3 pr-4 font-semibold">Metric</th>
              <th className="py-3 pr-4 font-semibold">Baseline</th>
              <th className="py-3 pr-4 font-semibold">Target</th>
              <th className="py-3 pr-4 font-semibold">Owner</th>
              <th className="py-3 pr-4 font-semibold">Cadence</th>
              <th className="py-3 pr-4 font-semibold">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.name} className="border-b border-slate-100 last:border-0">
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-2 font-semibold text-slate-950">
                    <Activity className="h-4 w-4 text-slate-500" />
                    {metric.name}
                  </div>
                </td>
                <td className="py-4 pr-4 leading-6 text-slate-700">
                  {metric.baseline}
                </td>
                <td className="py-4 pr-4 leading-6 text-slate-700">
                  {metric.target}
                </td>
                <td className="py-4 pr-4 text-slate-700">{metric.owner}</td>
                <td className="py-4 pr-4 text-slate-700">{metric.cadence}</td>
                <td className="py-4 pr-4">
                  <span
                    className={`rounded-md border px-2 py-1 text-xs font-semibold ${confidenceClass(
                      metric.confidence,
                    )}`}
                  >
                    {metric.confidence}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
