import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardTitle } from "./Card";
import { cn } from "@/lib/cn";

export function FormSection({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("space-y-5 p-5 sm:p-6", className)}>
      <div className="flex items-center gap-2.5 border-b border-border/80 pb-3.5">
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden /> : null}
        <CardTitle className="text-[13px] font-semibold tracking-tight">{title}</CardTitle>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </Card>
  );
}

export function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-xs font-medium text-muted">
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
