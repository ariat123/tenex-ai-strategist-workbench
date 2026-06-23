import { AlertCircle, KeyRound, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { TextField } from "@/components/ui/text-field";

type SynthesisErrorDetails = {
  errorType?: string;
  failureStage?: string;
  statusCode?: number;
  modelUsed?: string;
  rawOpenAIErrorName?: string;
  rawOpenAIErrorCode?: string;
  validationIssues?: {
    count: number;
    names: string[];
  };
};

type SynthesisPanelProps = {
  rawNotes: string;
  accessCode: string;
  aiConfigured: boolean;
  requiresAccessCode: boolean;
  onRawNotesChange: (value: string) => void;
  onAccessCodeChange: (value: string) => void;
  onSynthesize: () => void;
  loading: boolean;
  error: string;
  errorDetails: SynthesisErrorDetails | null;
  warnings: string[];
  model?: string;
};

export function SynthesisPanel({
  rawNotes,
  accessCode,
  aiConfigured,
  requiresAccessCode,
  onRawNotesChange,
  onAccessCodeChange,
  onSynthesize,
  loading,
  error,
  errorDetails,
  warnings,
  model,
}: SynthesisPanelProps) {
  const statusOrCode =
    errorDetails?.statusCode ??
    errorDetails?.rawOpenAIErrorCode ??
    errorDetails?.errorType;

  return (
    <Card>
      <SectionHeader
        eyebrow="Discovery intake"
        title="Paste messy discovery notes"
        description="AI structures notes for review. You validate the strategist readout before using the outputs."
        action={
          <Button
            variant="primary"
            onClick={onSynthesize}
            disabled={loading || !aiConfigured}
            className="whitespace-nowrap"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Structuring..." : "Structure notes"}
          </Button>
        }
      />

      {!aiConfigured ? (
        <div className="mb-4 flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          <AlertCircle className="mt-1 h-4 w-4 shrink-0" />
          <p>
            AI synthesis is not configured for this deployment. Sample scenarios,
            opportunity ranking, and strategist brief export still work.
          </p>
        </div>
      ) : null}

      {aiConfigured && requiresAccessCode ? (
        <div className="mb-4 grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[minmax(0,280px)_1fr] sm:items-end">
          <TextField
            label="AI demo code"
            value={accessCode}
            onChange={onAccessCodeChange}
            placeholder="Enter demo code"
          />
          <div className="flex gap-2 text-sm leading-6 text-slate-600">
            <KeyRound className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
            <p>
              Sample scenarios work without a code. AI synthesis may require a
              demo code to protect API usage.
            </p>
          </div>
        </div>
      ) : null}

      {aiConfigured && !requiresAccessCode ? (
        <p className="mb-4 text-sm leading-6 text-slate-600">
          Sample scenarios work without a code. AI synthesis may require a demo
          code to protect API usage.
        </p>
      ) : null}

      <textarea
        value={rawNotes}
        onChange={(event) => onRawNotesChange(event.target.value)}
        rows={9}
        placeholder="Paste stakeholder notes, operator observations, transcript excerpts, workflow notes, survey findings, system constraints, or process screenshots transcribed as text."
        className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />

      <div className="mt-3 grid gap-2 text-sm leading-6">
        <p className="text-slate-600">
          {aiConfigured
            ? "Use synthetic scenarios for demos. Use AI synthesis when you have real discovery notes, then review the fields that drive the recommendation."
            : "Use the synthetic scenarios to review the decision snapshot, opportunity ranking, build handoff, rollout plan, and strategist brief."}
        </p>
        {model ? (
          <p className="text-xs font-medium text-slate-500">
            Last synthesis model: {model}
          </p>
        ) : null}
        {error ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900">
            <div className="flex gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
            </div>
            {errorDetails ? (
              <div className="mt-3 grid gap-1 border-t border-amber-200 pt-3 text-xs leading-5">
                <p>
                  <span className="font-semibold">Failure stage: </span>
                  {errorDetails.failureStage ?? "not available"}
                </p>
                <p>
                  <span className="font-semibold">Model used: </span>
                  {errorDetails.modelUsed ?? "not available"}
                </p>
                <p>
                  <span className="font-semibold">Status/code: </span>
                  {statusOrCode ?? "not available"}
                </p>
                {errorDetails.rawOpenAIErrorName ? (
                  <p>
                    <span className="font-semibold">OpenAI error name: </span>
                    {errorDetails.rawOpenAIErrorName}
                  </p>
                ) : null}
                {errorDetails.validationIssues?.count ? (
                  <p>
                    <span className="font-semibold">Validation issues: </span>
                    {errorDetails.validationIssues.names.join(", ")}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
        {warnings.length ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Synthesis warnings
            </p>
            <ul className="mt-2 space-y-1 text-slate-700">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
