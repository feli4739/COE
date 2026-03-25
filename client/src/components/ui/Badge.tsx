import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: "default" | "success" | "muted";
  className?: string;
}) {
  const styles =
    variant === "success"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : variant === "muted"
        ? "bg-white/5 text-muted border-border"
        : "bg-primary/15 text-primary border-primary/30";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        styles,
        className
      )}
    >
      {children}
    </span>
  );
}
