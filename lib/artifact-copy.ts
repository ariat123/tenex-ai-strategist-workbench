import type { DiscoveryInput, PilotKind } from "@/lib/types";

const pilotKindPattern = /\s+\((workflow|measurement|reporting|knowledge|follow-up)\)$/i;
const workflowCapabilityPattern =
  /\b(triage|routing|route|intake|checklist|completeness|missing[- ]?info|follow[- ]?up|explanation|extractor|assistant|copilot|reviewed|human review|draft)\b/i;
const parentWorkflowPattern = /\b(triage|intake|routing assistant|route assistant|assistant|copilot)\b/i;
const supportingHelperPattern =
  /\b(checklist|completeness|missing[- ]?info|explanation extractor|extractor)\b/i;
const reportingOnlyPattern =
  /\b(dashboard|reporting|report|kpi|metric|metrics|measurement|visibility|scorecard|tracking layer|operating view)\b/i;

export function cleanGeneratedText(value: string) {
  return value
    .replace(/\bdemo\s+auditable\b/gi, "Show auditable")
    .replace(/\bdemo\s+/gi, "")
    .replace(/\s+\./g, ".")
    .replace(/\.{2,}/g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

export function cleanOpportunityTitle(title: string, discovery?: DiscoveryInput) {
  const cleaned = cleanGeneratedText(title).replace(pilotKindPattern, "").trim();
  const context = `${discovery?.domain ?? ""} ${discovery?.workflowName ?? ""}`;

  if (/^guided intake triage assistant$/i.test(cleaned)) {
    return /claim/i.test(context)
      ? "Claims intake triage assistant"
      : "Intake triage assistant";
  }

  return cleaned;
}

export function normalizePilotKindFromText(
  pilotKind: PilotKind,
  title: string,
  description: string,
): PilotKind {
  const text = `${title} ${description}`;

  if (supportingHelperPattern.test(text) && !parentWorkflowPattern.test(text)) {
    return /explanation|extractor/i.test(text) ? "knowledge" : "follow-up";
  }

  if (workflowCapabilityPattern.test(text)) {
    return /follow[- ]?up/i.test(text) && !parentWorkflowPattern.test(text)
      ? "follow-up"
      : "workflow";
  }

  if (reportingOnlyPattern.test(text)) {
    return pilotKind === "reporting" ? "reporting" : "measurement";
  }

  return pilotKind;
}

export function sentence(value: string) {
  const cleaned = cleanGeneratedText(value);

  if (!cleaned) {
    return cleaned;
  }

  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
}
