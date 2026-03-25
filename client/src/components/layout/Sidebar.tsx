import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, LogOut } from "lucide-react";
import { FireBurstLogo } from "@/components/branding/FireBurstLogo";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/authStore";

const link =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-white/5 hover:text-white";

export function Sidebar() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-surface/40">
      <div className="border-b border-border px-4 py-5">
        <FireBurstLogo variant="sidebar" />
        <p className="mt-2 text-[10px] uppercase tracking-widest text-muted">Personas</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <NavLink
          to="/"
          end
          className={({ isActive }) => cn(link, isActive && "bg-white/5 text-white")}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          Dashboard
        </NavLink>
        <NavLink
          to="/people"
          className={({ isActive }) => cn(link, isActive && "bg-white/5 text-white")}
        >
          <Users className="h-4 w-4 shrink-0" />
          Personas
        </NavLink>
      </nav>
      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={() => logout()}
          className={cn(link, "w-full text-left")}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Salir
        </button>
      </div>
    </aside>
  );
}
