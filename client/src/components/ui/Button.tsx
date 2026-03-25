import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "outline" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-primary to-accent text-white shadow-glow hover:opacity-95 active:scale-[0.99]",
  ghost: "bg-transparent text-muted hover:text-white hover:bg-white/5",
  outline:
    "border border-border bg-surface/50 text-white hover:bg-white/5 hover:border-primary/40",
  danger: "bg-red-600/90 text-white hover:bg-red-600",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
