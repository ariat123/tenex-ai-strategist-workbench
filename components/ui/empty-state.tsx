import type { ReactNode } from "react";
import { ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({
  eyebrow = "Waiting for discovery",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed bg-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600">
            <ClipboardList className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              {eyebrow}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              {title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </Card>
  );
}
