import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/stores/authStore";

export function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const qFromUrl = location.pathname.startsWith("/people") ? (params.get("q") ?? "") : "";
  const [value, setValue] = useState(qFromUrl);

  useEffect(() => {
    setValue(qFromUrl);
  }, [qFromUrl]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const v = value.trim();
      if (v) {
        navigate(`/people?q=${encodeURIComponent(v)}`, { replace: true });
        return;
      }
      if (location.pathname.startsWith("/people")) {
        navigate("/people", { replace: true });
      }
    }, 280);
    return () => window.clearTimeout(t);
  }, [value, navigate, location.pathname]);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-background/80 px-6 py-3 backdrop-blur-md">
      <div className="relative max-w-xl flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Búsqueda global (nombre, DNI, barrio)…"
          className="pl-10"
          aria-label="Búsqueda global"
        />
      </div>
      <div className="hidden text-right sm:block">
        <p className="text-xs text-muted">Sesión</p>
        <p className="max-w-[200px] truncate text-sm font-medium">{user?.email}</p>
      </div>
    </header>
  );
}
