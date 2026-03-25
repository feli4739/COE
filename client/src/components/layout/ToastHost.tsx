import { useToastStore } from "@/stores/toastStore";
import { CheckCircle2 } from "lucide-react";

export function ToastHost() {
  const message = useToastStore((s) => s.message);
  if (!message) return null;
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2">
      <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-primary/30 bg-surface px-4 py-3 text-sm shadow-glow">
        <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
        {message}
      </div>
    </div>
  );
}
