import type { ScenarioId, SectionId, WorkbenchCase } from "@/lib/types";

const STORAGE_KEY = "tenex-ai-strategist-workbench:v4";

export type StoredWorkbenchState = {
  activeCase: WorkbenchCase;
  selectedScenarioId: ScenarioId;
  rawNotes: string;
  activeSection: SectionId;
};

export function loadWorkbenchState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const state = raw ? (JSON.parse(raw) as StoredWorkbenchState) : null;

    if (
      state?.activeCase.mode === "live" &&
      state.activeCase.opportunities.length > 0
    ) {
      return null;
    }

    return state;
  } catch {
    return null;
  }
}

export function saveWorkbenchState(state: StoredWorkbenchState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearWorkbenchState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
