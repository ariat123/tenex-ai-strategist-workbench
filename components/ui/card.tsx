import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/format";

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  as?: "section" | "div" | "article";
};

export function Card({
  children,
  className,
  as: Component = "section",
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(
        "rounded-md border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
