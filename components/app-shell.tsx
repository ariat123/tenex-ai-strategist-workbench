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
import { FdeHandoffBrief } from "@/components/fde-handoff-brief";
import { GeneratedOutputEditor } from "@/components/generated-output-editor";
import { OpportunityScorecard } from "@/components/opportunity-scorecard";
import { RecommendedPilot } from "@/components/recommended-pilot";
import { ScenarioSelector } from "@/components/scenario-selector";
import { StateActions } from "@/components/state-actions";
import { StrategistBriefExport } from "@/components/strategist-brief-export";
import { SynthesisPanel } from "@/components/synthesis-panel";
import { ValueMeasurementPlan } from "@/components/value-measurement-plan";
import { WorkflowSummary } from "@/components/workflow-summary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { scenarios } from "@/data/scenarios";
import { downloadMarkdown, markdownFilename } from "@/lib/export";
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
} from "@/lib/workbench-case";
import { buildStrategistBrief } from "@/lib/briefs";
import type {
  DiscoveryInput,
  ScenarioId,
  SectionId,
  WorkbenchCase,
} from "@/lib/types";

const sections: TabItem<SectionId>[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "discovery", label: "Discovery", icon: ClipboardList },
  { id: "scoring", label: "Scoring", icon: SlidersHorizontal },
  { id: "pilot", label: "Pilot", icon: Rocket },
  { id: "adoption", label: "Adoption", icon: Handshake },
  { id: "handoff", label: "FDE handoff", icon: FileText },
  { id: "export", label: "Export", icon: LineChart },
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
    };

export function AppShell() {
  const [activeCase, setActiveCase] = useState<WorkbenchCase>(() =>
    defaultWorkbenchCase(),
  );
  const [selectedScenarioId, setSelectedScenarioId] =
    useState<ScenarioId>("insurer");
  const [rawNotes, setRawNotes] = useState("");
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [synthesisLoading, setSynthesisLoading] = useState(false);
  const [synthesisError, setSynthesisError] = useState("");
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
  const strategistBrief = useMemo(
    () =>
      buildStrategistBrief(
        activeCase.discovery,
        scoredOpportunities,
        activeCase.stakeholders,
        activeCase.adoptionRisks,
        activeCase.valueMetrics,
        activeCase.discoveryEvidence,
        activeCase.assumptionsToValidate,
        activeCase.workflowBottlenecks,
        recommendedPilot,
      ),
    [activeCase, scoredOpportunities, recommendedPilot],
  );

  useEffect(() => {
    const stored = loadWorkbenchState();

    if (stored) {
      window.setTimeout(() => {
        setActiveCase(stored.activeCase);
        setSelectedScenarioId(stored.selectedScenarioId);
        setRawNotes(stored.rawNotes);
        setActiveSection(stored.activeSection);
        setSaveStatus("Restored local workbench state.");
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
    setSynthesisError("");
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
    setSaveStatus("Saved locally.");
  }

  function resetWorkbench() {
    const nextCase = defaultWorkbenchCase();

    clearWorkbenchState();
    setActiveCase(nextCase);
    setSelectedScenarioId("insurer");
    setRawNotes("");
    setSynthesisError("");
    setSynthesisWarnings([]);
    setSynthesisModel("");
    setSynthesisAccessCode("");
    setActiveSection("overview");
    setSaveStatus("Reset to insurer demo scenario.");
  }

  function downloadBrief() {
    downloadMarkdown(markdownFilename(activeCase.label), strategistBrief);
    setSaveStatus("Downloaded Markdown brief.");
  }

  async function synthesizeDiscovery() {
    setSynthesisLoading(true);
    setSynthesisError("");
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
        setSynthesisError(result.error.message);
        return;
      }

      setActiveCase(result.workbenchCase);
      setRawNotes(result.workbenchCase.rawNotes ?? rawNotes);
      setSynthesisWarnings(result.warnings);
      setSynthesisModel(result.model);
      setActiveSection("overview");
      setSaveStatus("AI synthesis applied and saved locally.");
    } catch {
      setSynthesisError(
        "AI synthesis failed. Current workbench was not changed.",
      );
    } finally {
      setSynthesisLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Candidate prototype
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">
                Tenex AI Strategist Workbench
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Turn discovery notes into a prioritized AI pilot, FDE handoff,
                adoption plan, and value brief.
              </p>
            </div>
            <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 sm:min-w-80">
              <div>
                <span className="font-semibold text-slate-950">Mode: </span>
                {activeCase.mode === "demo"
                  ? "Demo scenario"
                  : "AI synthesis"}
              </div>
              <div>
                <span className="font-semibold text-slate-950">Workflow: </span>
                {activeCase.discovery.workflowName}
              </div>
              <Button size="sm" variant="secondary" onClick={() => setAboutOpen(true)}>
                About prototype
              </Button>
            </div>
          </div>
        </header>

        <StateActions
          saveStatus={saveStatus}
          onSave={saveNow}
          onReset={resetWorkbench}
          onDownload={downloadBrief}
        />

        <Tabs items={sections} activeId={activeSection} onChange={setActiveSection} />

        {activeSection === "overview" ? (
          <div className="grid gap-4">
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
            <Card>
              <SectionHeader
                eyebrow="Source mode"
                title={
                  activeCase.mode === "demo"
                    ? "Demo scenario mode"
                    : "AI synthesis mode"
                }
                description={
                  activeCase.mode === "demo"
                    ? "Synthetic preset data for walkthroughs. Switch scenarios or paste notes in Discovery."
                    : "This case was synthesized from pasted notes and remains fully editable."
                }
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
                    {activeCase.mode === "demo"
                      ? "Synthetic scenario data"
                      : "Pasted discovery notes"}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-slate-600" />
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Persistence
                    </p>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-slate-700">
                    Local browser storage only.
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <SectionHeader
                eyebrow="Scenario selection"
                title="Change the demo context"
                description="Synthetic presets remain available for quick walkthroughs."
              />
              <ScenarioSelector
                scenarios={scenarios}
                selectedId={selectedScenarioId}
                onSelect={selectScenario}
              />
            </Card>
            <WorkflowSummary
              discovery={activeCase.discovery}
              discoveryEvidence={activeCase.discoveryEvidence}
              workflowBottlenecks={activeCase.workflowBottlenecks}
            />
          </div>
        ) : null}

        {activeSection === "discovery" ? (
          <div className="grid gap-4">
            <SynthesisPanel
              rawNotes={rawNotes}
              accessCode={synthesisAccessCode}
              aiConfigured={synthesisConfigured}
              requiresAccessCode={synthesisRequiresAccessCode}
              onRawNotesChange={setRawNotes}
              onAccessCodeChange={setSynthesisAccessCode}
              onSynthesize={synthesizeDiscovery}
              loading={synthesisLoading}
              error={synthesisError}
              warnings={synthesisWarnings}
              model={synthesisModel}
            />
            <Card>
              <SectionHeader
                eyebrow="Structured inputs"
                title="Discovery notes and workflow context"
                description="Edit the structured inputs. Recommendations, handoff, adoption plan, and brief update locally."
              />
              <DiscoveryForm
                discovery={activeCase.discovery}
                onChange={updateDiscovery}
              />
            </Card>
            <GeneratedOutputEditor
              workbenchCase={activeCase}
              onChange={setActiveCase}
            />
          </div>
        ) : null}

        {activeSection === "scoring" ? (
          <OpportunityScorecard
            opportunities={scoredOpportunities}
            recommendedPilot={recommendedPilot}
          />
        ) : null}

        {activeSection === "pilot" ? (
          <RecommendedPilot
            discovery={activeCase.discovery}
            pilot={recommendedPilot}
            workflowBottlenecks={activeCase.workflowBottlenecks}
          />
        ) : null}

        {activeSection === "adoption" ? (
          <AdoptionPlan
            discovery={activeCase.discovery}
            pilot={recommendedPilot}
            stakeholders={activeCase.stakeholders}
            risks={activeCase.adoptionRisks}
            assumptionsToValidate={activeCase.assumptionsToValidate}
          />
        ) : null}

        {activeSection === "handoff" ? (
          <FdeHandoffBrief
            discovery={activeCase.discovery}
            pilot={recommendedPilot}
            risks={activeCase.adoptionRisks}
            metrics={activeCase.valueMetrics}
            assumptionsToValidate={activeCase.assumptionsToValidate}
            discoveryEvidence={activeCase.discoveryEvidence}
          />
        ) : null}

        {activeSection === "export" ? (
          <div className="grid gap-4">
            <ValueMeasurementPlan metrics={activeCase.valueMetrics} />
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
          </div>
        ) : null}

        <footer className="rounded-md border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-600">
          Candidate prototype built by Aria Tabatabai for the Tenex AI
          Strategist role. Based on public Tenex role language and public AI
          transformation materials. Uses synthetic scenarios only. Not an
          internal Tenex tool.
        </footer>
      </div>
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </main>
  );
}
