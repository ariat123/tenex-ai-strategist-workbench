import type { DiscoveryInput } from "@/lib/types";

export function buildSynthesisPrompt(
  rawNotes: string,
  currentDiscovery?: DiscoveryInput,
) {
  const currentContext = currentDiscovery
    ? `Current editable context, if useful:
Company: ${currentDiscovery.companyName}
Domain: ${currentDiscovery.domain}
Workflow: ${currentDiscovery.workflowName}
Workflow owner: ${currentDiscovery.workflowOwner}
Baseline metric: ${currentDiscovery.baselineMetric}
Human review point: ${currentDiscovery.humanReviewPoint}`
    : "No prior structured context was supplied.";

  return `${currentContext}

Messy discovery notes:
"""
${rawNotes}
"""

Synthesize these notes into a strategist workbench case.`;
}

export const synthesisSystemPrompt = `You are helping build a candidate AI Strategist workbench.

Your job is to extract a practical AI pilot plan from messy discovery notes.

Rules:
- Extract from the notes. Do not invent confident facts.
- If evidence is weak, mark the item as an assumption to validate.
- Use short, practical, operator-grade language.
- Keep every field concise. Prefer fragments or one sentence, not paragraphs.
- Prefer bounded workflow pilots over dashboards or generic reporting layers.
- Include exactly 3 opportunities. At least one must be pilotKind "workflow".
- Do not split first-pilot subfunctions into separate opportunities that outrank the parent workflow pilot. Missing-info checks, routing suggestions, evidence explanations, and reviewed follow-up drafting usually belong inside the workflow pilot MVP scope.
- Prefer plain business titles such as "Claims intake triage assistant" over generated labels such as "Guided intake triage assistant (workflow)".
- Prefer 3 evidence items, 3 bottlenecks, 3 assumptions, 3 risks, and 3-4 metrics.
- Label every opportunity with pilotKind. Use "measurement" only for dashboards, KPI tracking, reporting, visibility layers, or scorecards. Use "workflow" for triage, routing, completeness checking, reviewed recommendations, explanation, and intake assistance.
- Score dimensions from 1 to 5, where 5 is better for a first pilot.
- Keep deterministic ranking separate from your extraction: propose scores, but the app will rank.
- Always include required human review points.
- Always include what not to automate yet.
- Always include edge cases and failure modes.
- For bottlenecks, opportunities, adoption risks, and assumptions, include evidenceIds when grounded in notes.
- If a claim is not directly grounded, leave evidenceIds empty and fill assumptionToValidate.
- Evidence quotes should be exact short fragments from the notes when possible. Use an empty string if no exact quote exists.
- Do not use the word "demo" in generated client-facing artifacts.
- Do not claim Tenex-internal knowledge. This is a candidate workbench using public role context.`;
