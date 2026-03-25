import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Plus, List, Activity, HeartPulse, Inbox } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type { DashboardStats, Person } from "@/types/person";

export function DashboardPage() {
  const token = useAuthStore((s) => s.token);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [preview, setPreview] = useState<Person[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const s = (await apiFetch("/stats", { token })) as DashboardStats;
        const list = (await apiFetch("/people?pageSize=8&page=1", {
          token,
        })) as { items: Person[] };
        if (!cancelled) {
          setStats(s);
          setPreview(list.items);
        }
      } catch (e) {
        if (!cancelled && e instanceof ApiError) setErr(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Resumen operativo, KPIs y accesos rápidos al padrón de personas."
      />

      {err ? <p className="text-sm text-red-400">{err}</p> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="min-h-[112px] border-primary/15 bg-gradient-to-br from-[#141414] to-background/60">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                Total personas
              </p>
              <p className="mt-3 text-[1.85rem] font-semibold leading-none tracking-tight tabular-nums text-white">
                {stats?.totalPersonas ?? "—"}
              </p>
            </div>
            <div className="rounded-xl bg-primary/12 p-2.5 ring-1 ring-primary/20">
              <Users className="h-5 w-5 text-primary" aria-hidden />
            </div>
          </div>
        </Card>
        <Card className="min-h-[112px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                Con patologías
              </p>
              <p className="mt-3 text-[1.85rem] font-semibold leading-none tracking-tight tabular-nums text-white">
                {stats?.conPatologias ?? "—"}
              </p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-2.5 ring-1 ring-white/[0.06]">
              <HeartPulse className="h-5 w-5 text-rose-400/95" aria-hidden />
            </div>
          </div>
        </Card>
        <Card className="min-h-[112px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                Nuevos ingresos
              </p>
              <p className="mt-1 text-[10px] text-muted/90">Ventana últimos {stats?.newPeopleDays ?? 30} días</p>
              <p className="mt-2 text-[1.85rem] font-semibold leading-none tracking-tight tabular-nums text-white">
                {stats?.nuevosIngresos ?? "—"}
              </p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-2.5 ring-1 ring-white/[0.06]">
              <Activity className="h-5 w-5 text-emerald-400/95" aria-hidden />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/people/new">
          <Button className="gap-2 rounded-xl px-5 py-2.5">
            <Plus className="h-4 w-4" />
            Agregar persona
          </Button>
        </Link>
        <Link to="/people">
          <Button variant="outline" className="gap-2 rounded-xl px-5 py-2.5">
            <List className="h-4 w-4" />
            Ver listado
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-[13px] font-semibold tracking-tight text-white">Últimas personas</h2>
          <Link
            to="/people"
            className="text-[12px] font-medium text-primary/95 transition hover:text-primary"
          >
            Ver todo →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13px] leading-snug">
            <thead>
              <tr className="border-b border-border bg-white/[0.03] text-[11px] uppercase tracking-wider text-muted">
                <th className="px-5 py-2.5 font-semibold">Nombre</th>
                <th className="px-5 py-2.5 font-semibold">DNI</th>
                <th className="px-5 py-2.5 font-semibold">Barrio</th>
                <th className="px-5 py-2.5 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border/40 transition-colors last:border-0 hover:bg-white/[0.035]"
                >
                  <td className="px-5 py-2.5 font-medium text-white/95">
                    <Link to={`/people/${p.id}`} className="hover:text-primary">
                      {p.apellido}, {p.nombre}
                    </Link>
                  </td>
                  <td className="px-5 py-2.5 tabular-nums text-muted">{p.dni}</td>
                  <td className="px-5 py-2.5 text-muted">{p.barrio ?? "—"}</td>
                  <td className="px-5 py-2.5">
                    <span
                      className={
                        p.activo
                          ? "inline-flex rounded-md border border-emerald-500/20 bg-emerald-500/12 px-2 py-0.5 text-[11px] font-medium text-emerald-300"
                          : "inline-flex rounded-md border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-muted"
                      }
                    >
                      {p.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {preview.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
              <div className="rounded-2xl border border-border bg-surface/50 p-4">
                <Inbox className="mx-auto h-8 w-8 text-muted" aria-hidden />
              </div>
              <p className="max-w-xs text-[13px] text-muted">
                Aún no hay personas cargadas. Creá el primer registro o revisá la base de datos.
              </p>
              <Link to="/people/new">
                <Button className="rounded-xl">Agregar persona</Button>
              </Link>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
