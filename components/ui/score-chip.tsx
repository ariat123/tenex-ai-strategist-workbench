import { scoreBand } from "@/lib/scoring";
import { cn } from "@/lib/format";

type ScoreChipProps = {
  score: number;
  showBand?: boolean;
};

export function ScoreChip({ score, showBand = false }: ScoreChipProps) {
  const tone =
    score >= 80
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : score >= 65
        ? "border-sky-200 bg-sky-50 text-sky-800"
        : score >= 50
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-semibold",
        tone,
      )}
    >
      {score}/100
      {showBand ? <span className="font-medium">{scoreBand(score)}</span> : null}
    </span>
  );
}
