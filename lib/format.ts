import type { DiscoveryInput, ReadinessLevel } from "@/lib/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function cloneDiscovery(discovery: DiscoveryInput): DiscoveryInput {
  return JSON.parse(JSON.stringify(discovery)) as DiscoveryInput;
}

export function linesFromList(items: string[]) {
  return items.join("\n");
}

export function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function sentenceList(items: string[], fallback = "Not specified yet") {
  if (!items.length) {
    return fallback;
  }

  if (items.length === 1) {
    return items[0];
  }

  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

export function levelLabel(level: ReadinessLevel) {
  return {
    low: "Low",
    medium: "Medium",
    high: "High",
  }[level];
}

export function readinessScore(discovery: DiscoveryInput) {
  const values: Record<ReadinessLevel, number> = {
    low: 1,
    medium: 2,
    high: 3,
  };

  return Math.round(
    ((values[discovery.teamReadiness] + values[discovery.dataAvailability]) / 6) *
      100,
  );
}

export function fallbackText(value: string, fallback = "Not specified yet") {
  return value.trim() || fallback;
}

export function confidenceClass(confidence: "low" | "medium" | "high") {
  return {
    low: "border-amber-200 bg-amber-50 text-amber-800",
    medium: "border-sky-200 bg-sky-50 text-sky-800",
    high: "border-emerald-200 bg-emerald-50 text-emerald-800",
  }[confidence];
}
