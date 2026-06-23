import { Download, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

type StateActionsProps = {
  saveStatus: string;
  canDownload: boolean;
  onSave: () => void;
  onReset: () => void;
  onDownload: () => void;
};

export function StateActions({
  saveStatus,
  canDownload,
  onSave,
  onReset,
  onDownload,
}: StateActionsProps) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <span>{saveStatus || "Local browser state only. No database."}</span>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={onSave}>
          <Save className="h-3.5 w-3.5" />
          Save locally
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onDownload}
          disabled={!canDownload}
        >
          <Download className="h-3.5 w-3.5" />
          Download Markdown
        </Button>
        <Button size="sm" variant="ghost" onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>
    </div>
  );
}
