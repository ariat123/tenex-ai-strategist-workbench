import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/format";

export type TabItem<T extends string> = {
  id: T;
  label: string;
  icon?: LucideIcon;
};

type TabsProps<T extends string> = {
  items: TabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
};

export function Tabs<T extends string>({ items, activeId, onChange }: TabsProps<T>) {
  return (
    <nav className="flex gap-1 overflow-x-auto rounded-md border border-slate-200 bg-white p-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.id === activeId;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
              active
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
            )}
          >
            {Icon ? <Icon className="h-4 w-4" /> : null}
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
