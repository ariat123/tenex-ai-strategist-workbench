"use client";

import {
  ClipboardList,
  Database,
  FileText,
  Handshake,
  LayoutDashboard,
  LineChart,
  Rocket,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AboutModal } from "@/components/about-modal";
import { AdoptionPlan } from "@/components/adoption-plan";
import { DecisionSnapshot } from "@/components/decision-snapshot";
import { DiscoveryForm } from "@/components/discovery-form";
import { DiscoveryReview } from "@/components/discovery-review";
import { EngagementArc } from "@/components/engagement-arc";
import { FdeHandoffBrief } from "@/components/fde-handoff-brief";
import { GeneratedOutputEditor } from "@/components/generated-output-editor";
import { GuidedDiscovery } from "@/components/guided-discovery";
import { OpportunityScorecard } from "@/components/opportunity-scorecard";
import { RecommendedPilot } from "@/components/recommended-pilot";
import { ScenarioSelector } from "@/components/scenario-selector";
import { StateActions } from "@/components/state-actions";
import { StepPath } from "@/components/step-path";
import { StrategistBriefExport } from "@/components/strategist-brief-export";
import { SynthesisPanel } from "@/components/synthesis-panel";
import { ValueMeasurementPlan } from "@/components/value-measurement-plan";
import { WorkflowSummary } from "@/components/workflow-summary";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { scenarios } from "@/data/scenarios";
import { downloadMarkdown, markdownFilename } from "@/lib/export";
import { surfaces } from "@/lib/surfaces";
import {
  scoreOpportunities,
  selectRecommendedPilot,
} from "@/lib/scoring";
import {
  clearWorkbenchState,
  loadWorkbenchState,
  saveWorkbenchState,
} from "@/lib/storage";
import {
  caseFromScenarioId,
  defaultWorkbenchCase,
  hydrateWorkbenchCase,
} from "@/lib/workbench-case";
import { buildStrategistBrief } from "@/lib/briefs";
import type {
  DiscoveryInput,
  ScenarioId,
  SectionId,
  WorkbenchCase,
} from "@/lib/types";

const sections: TabItem<SectionId>[] = [
  { id: "discovery", label: "Discovery", icon: ClipboardList },
  { id: "overview", label: "Decision snapshot", icon: LayoutDashboard },
  { id: "pilot", label: "First pilot", icon: Rocket },
  { id: "handoff", label: "Build handoff", icon: FileText },
  { id: "export", label: "Final brief", icon: LineChart },
  {
    id: "scoring",
    label: "Opportunity ranking",
    icon: SlidersHorizontal,
    secondary: true,
  },
  {
    id: "adoption",
    label: "Adoption & rollout",
    icon: Handshake,
    secondary: true,
  },
];

const workbenchPath = [
  "Discovery",
  "Decision snapshot",
  "First pilot",
  "Build handoff",
  "Final brief",
];

type SynthesisResponse =
  | {
      ok: true;
      workbenchCase: WorkbenchCase;
      warnings: string[];
      model: string;
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
      };
      errorType?: string;
      failureStage?: string;
      statusCode?: number;
      modelUsed?: string;
      message?: string;
      rawOpenAIErrorName?: string;
      rawOpenAIErrorCode?: string;
      validationIssues?: {
        count: number;
        names: string[];
      };
    };

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

function PendingReadout({
  title,
  description,
  onStart,
}: {
  title: string;
  description: string;
  onStart: () => void;
}) {
  return (
    <EmptyState
      eyebrow="Discovery required"
        title={title}
        description={description}
        action={
          <Button variant="primary" onClick={onStart}>
            Go to Discovery
          </Button>
        }
    />
  );
}

export function AppShell() {
  const [activeCase, setActiveCase] = useState<WorkbenchCase>(() =>
    defaultWorkbenchCase(),
  );
  const [selectedScenarioId, setSelectedScenarioId] =
    useState<ScenarioId>("custom");
  const [rawNotes, setRawNotes] = useState("");
  const [discoveryStartMode, setDiscoveryStartMode] = useState<
    "notes" | "guide"
  >("notes");
  const [activeSection, setActiveSection] = useState<SectionId>("discovery");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [synthesisLoading, setSynthesisLoading] = useState(false);
  const [synthesisError, setSynthesisError] = useState("");
  const [synthesisErrorDetails, setSynthesisErrorDetails] =
    useState<SynthesisErrorDetails | null>(null);
  const [synthesisWarnings, setSynthesisWarnings] = useState<string[]>([]);
  const [synthesisModel, setSynthesisModel] = useState("");
  const [synthesisAccessCode, setSynthesisAccessCode] = useState("");
  const [synthesisConfigured, setSynthesisConfigured] = useState(true);
  const [synthesisRequiresAccessCode, setSynthesisRequiresAccessCode] =
    useState(false);
  const localStateReady = useRef(false);

  const scoredOpportunities = useMemo(
    () => scoreOpportunities(activeCase.opportunities),
    [activeCase.opportunities],
  );
  const recommendedPilot =
    selectRecommendedPilot(scoredOpportunities, activeCase.discovery) ??
    scoredOpportunities[0];
  const hasStructuredReadout = Boolean(recommendedPilot);
  const strategistBrief = useMemo(
    () => {
      if (!recommendedPilot) {
        return "";
      }

      return buildStrategistBrief(
          activeCase.discovery,
          scoredOpportunities,
          activeCase.stakeholders,
          activeCase.adoptionRisks,
          activeCase.valueMetrics,
          activeCase.discoveryEvidence,
          activeCase.assumptionsToValidate,
          activeCase.workflowBottlenecks,
          recommendedPilot,
        );
    },
    [activeCase, scoredOpportunities, recommendedPilot],
  );
  const modeLabel =
    activeCase.mode === "ai-synthesis"
      ? "AI synthesized case"
      : activeCase.mode === "example"
        ? "Example case"
        : "Live discovery case";
  const modeChipClass =
    activeCase.mode === "ai-synthesis"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : activeCase.mode === "example"
        ? "border-slate-200 bg-slate-100 text-slate-700"
        : "border-indigo-200 bg-indigo-50 text-indigo-800";
  const workflowChipClass = activeCase.discovery.workflowName
    ? "border-slate-200 bg-white text-slate-700"
    : "border-amber-200 bg-amber-50 text-amber-800";
  const sourceModeTitle = modeLabel;
  const sourceModeDescription =
    activeCase.mode === "ai-synthesis"
      ? "This case was synthesized from pasted discovery notes and remains fully editable."
      : activeCase.mode === "example"
        ? "This optional example case is editable and useful for exploring the workbench structure."
        : "Start by pasting discovery notes, then review the structured strategist readout.";
  const dataSourceLabel =
    activeCase.mode === "ai-synthesis"
      ? "Pasted discovery notes"
      : activeCase.mode === "example"
        ? "Optional example case"
        : "Live discovery input";

  useEffect(() => {
    const stored = loadWorkbenchState();

    if (stored) {
      window.setTimeout(() => {
        setActiveCase(hydrateWorkbenchCase(stored.activeCase));
        setSelectedScenarioId(stored.selectedScenarioId);
        setRawNotes(stored.rawNotes);
        setActiveSection(stored.activeSection);
        setSaveStatus("Restored browser workbench state.");
        localStateReady.current = true;
      }, 0);

      return;
    }

    localStateReady.current = true;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSynthesisConfig() {
      try {
        const response = await fetch("/api/synthesize-discovery", {
          method: "GET",
          cache: "no-store",
        });
        const result = (await response.json()) as {
          aiConfigured?: boolean;
          requiresAccessCode?: boolean;
        };

        if (!cancelled) {
          setSynthesisConfigured(result.aiConfigured !== false);
          setSynthesisRequiresAccessCode(Boolean(result.requiresAccessCode));
        }
      } catch {
        if (!cancelled) {
          setSynthesisConfigured(true);
          setSynthesisRequiresAccessCode(false);
        }
      }
    }

    void loadSynthesisConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!localStateReady.current) {
      return;
    }

    saveWorkbenchState({
      activeCase,
      selectedScenarioId,
      rawNotes,
      activeSection,
    });
  }, [activeCase, selectedScenarioId, rawNotes, activeSection]);

  function updateDiscovery(discovery: DiscoveryInput) {
    setActiveCase((current) => ({ ...current, discovery }));
  }

  function selectScenario(id: ScenarioId) {
    const nextCase = caseFromScenarioId(id);

    setSelectedScenarioId(id);
    setActiveCase(nextCase);
    setRawNotes("");
    setDiscoveryStartMode("notes");
    setSynthesisError("");
    setSynthesisErrorDetails(null);
    setSynthesisWarnings([]);
    setSynthesisModel("");
    setSynthesisAccessCode("");
    setActiveSection("overview");
  }

  function saveNow() {
    saveWorkbenchState({
      activeCase,
      selectedScenarioId,
      rawNotes,
      activeSection,
    });
    setSaveStatus("Saved in browser.");
  }

  function resetWorkbench() {
    const nextCase = defaultWorkbenchCase();

    clearWorkbenchState();
    setActiveCase(nextCase);
    setSelectedScenarioId("custom");
    setRawNotes("");
    setDiscoveryStartMode("notes");
    setSynthesisError("");
    setSynthesisErrorDetails(null);
    setSynthesisWarnings([]);
    setSynthesisModel("");
    setSynthesisAccessCode("");
    setActiveSection("discovery");
    setSaveStatus("Reset to a blank live discovery case.");
  }

  function downloadBrief() {
    if (!strategistBrief) {
      setActiveSection("discovery");
      setSaveStatus("Structure discovery notes before downloading a brief.");
      return;
    }

    downloadMarkdown(markdownFilename(activeCase.label), strategistBrief);
    setSaveStatus("Downloaded brief.");
  }

  function useGuidedDiscoveryNotes(notes: string) {
    setRawNotes(notes);
    setDiscoveryStartMode("notes");
    setSaveStatus("Guided discovery answers copied into discovery notes.");
  }

  async function synthesizeDiscovery() {
    setSynthesisLoading(true);
    setSynthesisError("");
    setSynthesisErrorDetails(null);
    setSynthesisWarnings([]);

    try {
      const response = await fetch("/api/synthesize-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawNotes,
          currentDiscovery: activeCase.discovery,
          accessCode: synthesisAccessCode,
        }),
      });
      const result = (await response.json()) as SynthesisResponse;

      if (!result.ok) {
        if (result.error.code === "missing_api_key") {
          setSynthesisConfigured(false);
        }
        if (result.error.code === "protected") {
          setSynthesisRequiresAccessCode(true);
        }
        setSynthesisError(result.message ?? result.error.message);
        setSynthesisErrorDetails({
          errorType: result.errorType ?? result.error.code,
          failureStage: result.failureStage,
          statusCode: result.statusCode,
          modelUsed: result.modelUsed,
          rawOpenAIErrorName: result.rawOpenAIErrorName,
          rawOpenAIErrorCode: result.rawOpenAIErrorCode,
          validationIssues: result.validationIssues,
        });
        return;
      }

      setActiveCase(result.workbenchCase);
      setRawNotes(result.workbenchCase.rawNotes ?? rawNotes);
      setSynthesisWarnings(result.warnings);
      setSynthesisModel(result.model);
      setSynthesisErrorDetails(null);
      setActiveSection("overview");
      setSaveStatus("AI synthesized case applied and saved in browser.");
    } catch (error) {
      setSynthesisError(
        "Synthesis failed before updating the workbench. Current case preserved.",
      );
      setSynthesisErrorDetails({
        errorType: "app_exception",
        failureStage: "app_exception",
        rawOpenAIErrorName: error instanceof Error ? error.name : undefined,
      });
    } finally {
      setSynthesisLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Candidate workbench
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">
                Tenex AI Strategist Workbench
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Turn discovery into a decision snapshot, first AI pilot, build
                handoff, adoption path, and final brief.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 sm:min-w-80">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${modeChipClass}`}
                >
                  {modeLabel}
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${workflowChipClass}`}
                >
                  {activeCase.discovery.workflowName || "Workflow not specified"}
                </span>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setAboutOpen(true)}>
                About this workbench
              </Button>
            </div>
          </div>
        </header>

        <StateActions
          saveStatus={saveStatus}
          canDownload={hasStructuredReadout}
          onSave={saveNow}
          onReset={resetWorkbench}
          onDownload={downloadBrief}
        />

        <Tabs items={sections} activeId={activeSection} onChange={setActiveSection} />
        <EngagementArc />
        <StepPath
          activeSection={activeSection}
          hasStructuredReadout={hasStructuredReadout}
          onSelect={setActiveSection}
        />

        {activeSection === "overview" ? (
          <div className="grid gap-4">
            {hasStructuredReadout && recommendedPilot ? (
              <DecisionSnapshot
                discovery={activeCase.discovery}
                opportunities={scoredOpportunities}
                recommendedPilot={recommendedPilot}
                stakeholders={activeCase.stakeholders}
                risks={activeCase.adoptionRisks}
                metrics={activeCase.valueMetrics}
                discoveryEvidence={activeCase.discoveryEvidence}
                assumptionsToValidate={activeCase.assumptionsToValidate}
                workflowBottlenecks={activeCase.workflowBottlenecks}
              />
            ) : (
              <PendingReadout
                title="Decision snapshot pending"
                description="Structure discovery notes to generate the strategist readout."
                onStart={() => setActiveSection("discovery")}
              />
            )}
            {hasStructuredReadout ? (
              <>
                <WorkflowSummary
                  discovery={activeCase.discovery}
                  discoveryEvidence={activeCase.discoveryEvidence}
                  workflowBottlenecks={activeCase.workflowBottlenecks}
                />
                <details className={surfaces.advancedSurface}>
                  <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-slate-950 marker:text-slate-500">
                    Supporting context and source
                    <span className="mt-1 block text-sm font-normal leading-6 text-slate-600">
                      Source, browser storage, and the supporting workbench
                      path.
                    </span>
                  </summary>
                  <div className={`grid gap-4 ${surfaces.advancedPanel}`}>
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Workbench path
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {workbenchPath.map((step, index) => (
                          <div key={step} className="flex items-center gap-2">
                            <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {step}
                            </span>
                            {index < workbenchPath.length - 1 ? (
                              <span className="text-xs font-semibold text-slate-400">
                                -&gt;
                              </span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <SectionHeader
                        eyebrow="Source"
                        title={sourceModeTitle}
                        description={sourceModeDescription}
                      />
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs font-semibold uppercase text-slate-500">
                            Active case
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-950">
                            {activeCase.label}
                          </p>
                        </div>
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs font-semibold uppercase text-slate-500">
                            Data source
                          </p>
                          <p className="mt-1 text-sm leading-5 text-slate-700">
                            {dataSourceLabel}
                          </p>
                        </div>
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-slate-600" />
                            <p className="text-xs font-semibold uppercase text-slate-500">
                              Storage
                            </p>
                          </div>
                          <p className="mt-1 text-sm leading-5 text-slate-700">
                            Saved in this browser only.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </details>
              </>
            ) : null}
          </div>
        ) : null}

        {activeSection === "discovery" ? (
          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setDiscoveryStartMode("notes")}
                className={`rounded-md border p-4 text-left shadow-sm transition-colors ${
                  discoveryStartMode === "notes"
                    ? "border-indigo-300 bg-indigo-50/70"
                    : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${
                      discoveryStartMode === "notes"
                        ? "border-indigo-200 bg-white text-indigo-700"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <ClipboardList className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2
                        className={`text-base font-semibold ${
                          discoveryStartMode === "notes"
                            ? "text-indigo-950"
                            : "text-slate-950"
                        }`}
                      >
                        Start from notes
                      </h2>
                      {discoveryStartMode === "notes" ? (
                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                          Active
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Paste messy discovery notes from a client conversation and structure them into a strategist readout.
                    </p>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setDiscoveryStartMode("guide")}
                className={`rounded-md border p-4 text-left shadow-sm transition-colors ${
                  discoveryStartMode === "guide"
                    ? "border-violet-300 bg-violet-50/70"
                    : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${
                      discoveryStartMode === "guide"
                        ? "border-violet-200 bg-white text-violet-700"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2
                        className={`text-base font-semibold ${
                          discoveryStartMode === "guide"
                            ? "text-violet-950"
                            : "text-slate-950"
                        }`}
                      >
                        Prepare discovery guide
                      </h2>
                      {discoveryStartMode === "guide" ? (
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                          Active
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Create a focused question guide before or during
                      discovery, capture answers, then turn them into the same
                      strategist readout.
                    </p>
                  </div>
                </div>
              </button>
            </div>
            {discoveryStartMode === "notes" ? (
              <SynthesisPanel
                rawNotes={rawNotes}
                accessCode={synthesisAccessCode}
                aiConfigured={synthesisConfigured}
                requiresAccessCode={synthesisRequiresAccessCode}
                executiveMandate={activeCase.discovery.executiveMandate}
                onRawNotesChange={setRawNotes}
                onAccessCodeChange={setSynthesisAccessCode}
                onExecutiveMandateChange={(executiveMandate) =>
                  updateDiscovery({
                    ...activeCase.discovery,
                    executiveMandate,
                  })
                }
                onSynthesize={synthesizeDiscovery}
                loading={synthesisLoading}
                error={synthesisError}
                errorDetails={synthesisErrorDetails}
                warnings={synthesisWarnings}
                model={synthesisModel}
              />
            ) : (
              <GuidedDiscovery
                onUseAsNotes={useGuidedDiscoveryNotes}
                executiveMandate={activeCase.discovery.executiveMandate}
                onExecutiveMandateChange={(executiveMandate) =>
                  updateDiscovery({
                    ...activeCase.discovery,
                    executiveMandate,
                  })
                }
              />
            )}
            {hasStructuredReadout ? (
              <DiscoveryReview
                workbenchCase={activeCase}
                onChange={setActiveCase}
              />
            ) : null}
            <details className={surfaces.advancedSurface}>
              <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-slate-950 marker:text-slate-500">
                Example cases
              </summary>
              <div className={surfaces.advancedPanel}>
                <SectionHeader
                  eyebrow="Optional"
                  title="Example cases"
                  description="Optional. Use these only to explore the workbench without entering your own notes."
                />
                <ScenarioSelector
                  scenarios={scenarios}
                  selectedId={
                    activeCase.mode === "example" ? selectedScenarioId : undefined
                  }
                  onSelect={selectScenario}
                />
              </div>
            </details>
            <details className={surfaces.advancedSurface}>
              <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-slate-950 marker:text-slate-500">
                Advanced discovery context
                <span className="mt-1 block text-sm font-normal leading-6 text-slate-600">
                  Edit the full workflow, notes, systems, constraints, readiness,
                  and failure modes when the compact review is not enough.
                </span>
              </summary>
              <div className={surfaces.advancedPanel}>
                <SectionHeader
                  eyebrow="Full discovery context"
                  title="All structured discovery fields"
                  description="These details feed the recommendation, build handoff, adoption path, and final brief."
                />
                <DiscoveryForm
                  discovery={activeCase.discovery}
                  onChange={updateDiscovery}
                />
              </div>
            </details>
            <details className={surfaces.advancedSurface}>
              <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-slate-950 marker:text-slate-500">
                Advanced recommendation details
                <span className="mt-1 block text-sm font-normal leading-6 text-slate-600">
                  Adjust opportunity details, scoring inputs, adoption risks, and
                  value metrics only when the strategist readout needs deeper edits.
                </span>
              </summary>
              <div className={surfaces.advancedPanel}>
                <GeneratedOutputEditor
                  workbenchCase={activeCase}
                  onChange={setActiveCase}
                />
              </div>
            </details>
          </div>
        ) : null}

        {activeSection === "scoring" ? (
          hasStructuredReadout && recommendedPilot ? (
            <OpportunityScorecard
              opportunities={scoredOpportunities}
              recommendedPilot={recommendedPilot}
            />
          ) : (
            <PendingReadout
              title="Opportunity ranking pending"
              description="After synthesis, this will compare candidate pilots."
              onStart={() => setActiveSection("discovery")}
            />
          )
        ) : null}

        {activeSection === "pilot" ? (
          hasStructuredReadout && recommendedPilot ? (
            <RecommendedPilot
              discovery={activeCase.discovery}
              pilot={recommendedPilot}
              workflowBottlenecks={activeCase.workflowBottlenecks}
            />
          ) : (
            <PendingReadout
              title="First pilot pending"
              description="After synthesis, this will define the first bounded AI pilot."
              onStart={() => setActiveSection("discovery")}
            />
          )
        ) : null}

        {activeSection === "adoption" ? (
          hasStructuredReadout && recommendedPilot ? (
            <div className="grid gap-4">
              <AdoptionPlan
                discovery={activeCase.discovery}
                pilot={recommendedPilot}
                stakeholders={activeCase.stakeholders}
                risks={activeCase.adoptionRisks}
                assumptionsToValidate={activeCase.assumptionsToValidate}
              />
              <ValueMeasurementPlan metrics={activeCase.valueMetrics} />
            </div>
          ) : (
            <PendingReadout
              title="Adoption & rollout pending"
              description="After synthesis, this will map stakeholders, rollout risks, and value measurement."
              onStart={() => setActiveSection("discovery")}
            />
          )
        ) : null}

        {activeSection === "handoff" ? (
          hasStructuredReadout && recommendedPilot ? (
            <FdeHandoffBrief
              discovery={activeCase.discovery}
              pilot={recommendedPilot}
              risks={activeCase.adoptionRisks}
              metrics={activeCase.valueMetrics}
              assumptionsToValidate={activeCase.assumptionsToValidate}
              discoveryEvidence={activeCase.discoveryEvidence}
            />
          ) : (
            <PendingReadout
              title="Build handoff pending"
              description="After synthesis, this will create a build brief for the implementation team."
              onStart={() => setActiveSection("discovery")}
            />
          )
        ) : null}

        {activeSection === "export" ? (
          hasStructuredReadout && recommendedPilot ? (
            <div className="grid gap-4">
              <StrategistBriefExport
                discovery={activeCase.discovery}
                opportunities={scoredOpportunities}
                recommendedPilot={recommendedPilot}
                stakeholders={activeCase.stakeholders}
                risks={activeCase.adoptionRisks}
                metrics={activeCase.valueMetrics}
                discoveryEvidence={activeCase.discoveryEvidence}
                assumptionsToValidate={activeCase.assumptionsToValidate}
                workflowBottlenecks={activeCase.workflowBottlenecks}
              />
              <ValueMeasurementPlan metrics={activeCase.valueMetrics} />
            </div>
          ) : (
            <PendingReadout
              title="Final brief pending"
              description="After synthesis, this will generate the final strategist brief."
              onStart={() => setActiveSection("discovery")}
            />
          )
        ) : null}

        <footer className="rounded-md border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-600">
          Candidate workbench built by Aria Tabatabai for the Tenex AI
          Strategist role. Based on public Tenex role language and public AI
          transformation materials. Includes optional example cases. Not an
          internal Tenex tool. It supports the middle of an AI Strategist
          engagement: executive mandate, discovery, pilot decision, build
          handoff, adoption path, value proof, and reusable learning.
        </footer>
      </div>
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </main>
  );
}
