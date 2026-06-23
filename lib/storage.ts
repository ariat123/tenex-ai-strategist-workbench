import type { ScenarioId, SectionId, WorkbenchCase } from "@/lib/types";

const STORAGE_KEY = "tenex-ai-strategist-workbench:v3";

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
    return raw ? (JSON.parse(raw) as StoredWorkbenchState) : null;
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
