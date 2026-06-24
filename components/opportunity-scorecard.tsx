import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScoreChip } from "@/components/ui/score-chip";
import { SectionHeader } from "@/components/ui/section-header";
import {
  caveatForOpportunity,
  dimensionLabel,
  displayDimensionValue,
  scoringModel,
  topDimensionDrivers,
} from "@/lib/scoring";
import { cleanGeneratedText, cleanOpportunityTitle } from "@/lib/artifact-copy";
import type { ScoredOpportunity } from "@/lib/types";

type OpportunityScorecardProps = {
  opportunities: ScoredOpportunity[];
  recommendedPilot: ScoredOpportunity;
};

export function OpportunityScorecard({
  opportunities,
  recommendedPilot,
}: OpportunityScorecardProps) {
  const winner = recommendedPilot;
  const rawWinner = opportunities[0];
  const drivers = topDimensionDrivers(winner);
  const recommendationDiffers = rawWinner.id !== winner.id;
  const winnerTitle = cleanOpportunityTitle(winner.title);
  const rawWinnerTitle = cleanOpportunityTitle(rawWinner.title);

  return (
    <div className="grid gap-4">
      <Card>
        <SectionHeader
          eyebrow="Opportunity ranking"
          title="Transparent pilot prioritization"
          description="Supporting detail for calibration. The scorecard makes the recommendation inspectable, but the first pilot remains a bounded workflow judgment."
        />
        <details className="rounded-md border border-slate-200 bg-slate-50">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-950 marker:text-slate-500">
            How scoring works
            <span className="ml-2 text-sm font-normal text-slate-600">
              Deterministic weights, visible when needed.
            </span>
          </summary>
          <div className="grid gap-2 border-t border-slate-200 p-3 md:grid-cols-2 xl:grid-cols-4">
            {scoringModel.map((rule) => (
              <div
                key={rule.key}
                className="rounded-md border border-slate-200 bg-white p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">
                    {rule.label}
                  </p>
                  <span className="text-xs font-semibold text-slate-600">
                    {Math.round(rule.weight * 100)}%
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {rule.description}
                </p>
              </div>
            ))}
          </div>
        </details>
      </Card>

      <Card>
        <SectionHeader
          eyebrow="Why this is recommended"
          title={winnerTitle}
          description={cleanGeneratedText(winner.rationale)}
          action={<ScoreChip score={winner.weightedScore} showBand />}
        />
        <p className="mb-3 rounded-md border border-indigo-100 bg-indigo-50/50 p-3 text-sm leading-6 text-indigo-950">
          Supporting detail for calibration and rollout; the primary
          recommendation is in Decision snapshot.
        </p>
        {recommendationDiffers ? (
          <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
            The highest raw score is {rawWinnerTitle}, but the strategist
            recommendation starts with the bounded workflow pilot. Supporting
            helpers can be folded into MVP scope instead of becoming a separate
            first pilot.
          </div>
        ) : null}
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Why this pilot is recommended
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {winner.explanation}. The recommendation prioritizes a bounded
              workflow intervention with a clear human review boundary.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Dimensions driving the score
            </p>
            <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
              {drivers.map((driver) => (
                <li key={driver.label}>
                  {driver.label}: {driver.value}/5
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Human judgment caveat
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {caveatForOpportunity(winner)}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-slate-700" />
          <h3 className="text-base font-semibold text-slate-950">
            Ranked opportunities
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 pr-4 font-semibold">Rank</th>
                <th className="py-3 pr-4 font-semibold">Opportunity</th>
                <th className="py-3 pr-4 font-semibold">Score</th>
                <th className="py-3 pr-4 font-semibold">Why</th>
                <th className="py-3 pr-4 font-semibold">Key dimensions</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opportunity, index) => (
                <tr
                  key={opportunity.id}
                  className="border-b border-slate-100 align-top last:border-0"
                >
                  <td className="py-4 pr-4 text-slate-600">{index + 1}</td>
                  <td className="py-4 pr-4">
                    <p className="font-semibold text-slate-950">
                      {cleanOpportunityTitle(opportunity.title)}
                    </p>
                    <p className="mt-1 max-w-md leading-6 text-slate-600">
                      {opportunity.description}
                    </p>
                  </td>
                  <td className="py-4 pr-4">
                    <ScoreChip score={opportunity.weightedScore} showBand />
                  </td>
                  <td className="py-4 pr-4">
                    <p className="max-w-sm leading-6 text-slate-700">
                      {opportunity.explanation}
                    </p>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="grid gap-2">
                      {Object.entries(opportunity.dimensions).map(
                        ([key, value]) => {
                          const displayValue = displayDimensionValue(value);

                          return (
                            <div
                              key={key}
                              className="grid grid-cols-[150px_1fr_28px] items-center gap-2"
                            >
                              <span className="text-xs text-slate-500">
                                {dimensionLabel(key)}
                              </span>
                              <div className="h-2 rounded-md bg-slate-100">
                                <div
                                  className="h-2 rounded-md bg-slate-700"
                                  style={{ width: `${(displayValue / 5) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-slate-700">
                                {displayValue}
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
