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
    <div className="flex flex-col gap-2 rounded-md border border-slate-300 bg-white/80 p-2.5 text-xs text-slate-500 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <span className="px-1">{saveStatus || "Saved in this browser only."}</span>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={onSave}>
          <Save className="h-3.5 w-3.5" />
          Save in browser
        </Button>
        <Button
          size="sm"
          variant={canDownload ? "primary" : "secondary"}
          onClick={onDownload}
          disabled={!canDownload}
        >
          <Download className="h-3.5 w-3.5" />
          Download brief
        </Button>
        <Button size="sm" variant="ghost" onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>
    </div>
  );
}
