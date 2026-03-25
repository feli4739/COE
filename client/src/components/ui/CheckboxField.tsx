import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const CheckboxField = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: string }
>(function CheckboxField({ label, className, ...props }, ref) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-2 text-sm",
        className
      )}
    >
      <input
        type="checkbox"
        ref={ref}
        className="h-4 w-4 rounded border-border text-primary"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
});
