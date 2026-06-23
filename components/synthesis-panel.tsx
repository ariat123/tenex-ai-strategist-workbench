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
        title="Start with discovery notes"
        description="Paste messy notes from a client conversation. The workbench will structure them into a recommended AI pilot, opportunity ranking, rollout plan, build handoff, and strategist brief."
        action={
          <Button
            variant="primary"
            size="md"
            onClick={onSynthesize}
            disabled={loading || !aiConfigured}
            className="whitespace-nowrap"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Structuring..." : "Structure discovery notes"}
          </Button>
        }
      />

      {!aiConfigured ? (
        <div className="mb-4 flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          <AlertCircle className="mt-1 h-4 w-4 shrink-0" />
          <p>
            AI synthesis is not configured for this deployment. The workbench
            still supports editing, opportunity ranking, and strategist brief
            export.
          </p>
        </div>
      ) : null}

      {aiConfigured && requiresAccessCode ? (
        <div className="mb-4 grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[minmax(0,280px)_1fr] sm:items-end">
          <TextField
            label="Access code"
            value={accessCode}
            onChange={onAccessCodeChange}
            placeholder="Enter access code"
          />
          <div className="flex gap-2 text-sm leading-6 text-slate-600">
            <KeyRound className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
            <p>Required for live AI synthesis.</p>
          </div>
        </div>
      ) : null}

      {aiConfigured && !requiresAccessCode ? (
        <p className="mb-4 text-sm leading-6 text-slate-600">
          Live AI synthesis is available for this deployment.
        </p>
      ) : null}

      <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase text-slate-500">
          Input required
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          Paste raw discovery notes here. Include the client goal, workflow
          steps, systems, bottlenecks, constraints, stakeholders, adoption
          concerns, and anything that must stay human reviewed.
        </p>
      </div>

      <textarea
        value={rawNotes}
        onChange={(event) => onRawNotesChange(event.target.value)}
        rows={12}
        placeholder="Paste stakeholder notes, operator observations, transcript excerpts, workflow notes, survey findings, system constraints, or process screenshots transcribed as text."
        className="w-full resize-y rounded-md border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-950 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />

      <div className="mt-3 grid gap-2 text-sm leading-6">
        {model ? (
          <p className="text-xs font-medium text-slate-500">
            Last synthesis model: {model}
          </p>
        ) : null}
        {error ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <div className="flex gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
            {errorDetails ? (
              <div className="mt-3 grid gap-1 border-t border-amber-200 pt-3 text-xs leading-5 text-amber-900">
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
