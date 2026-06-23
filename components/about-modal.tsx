"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type AboutModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AboutModal({ open, onClose }: AboutModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
      <div className="w-full max-w-lg rounded-md border border-slate-200 bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              About this prototype
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              Tenex AI Strategist Workbench
            </h2>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} aria-label="Close about modal">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm leading-6 text-slate-700">
          Candidate prototype built by Aria Tabatabai for the Tenex AI
          Strategist role. Based on public Tenex role language and public AI
          transformation materials. Uses synthetic scenarios only. Not an
          internal Tenex tool.
        </p>
      </div>
    </div>
  );
}
