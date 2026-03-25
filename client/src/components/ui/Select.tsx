import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Select({
  className,
  error,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <div className="w-full">
      <select
        className={cn(
          "w-full rounded-lg border border-border bg-surface/80 px-3 py-2 text-sm text-white",
          "transition focus:border-primary/50 focus:shadow-[0_0_0_1px_rgba(255,46,0,0.35)]",
          error && "border-red-500/60",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
