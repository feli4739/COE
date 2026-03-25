import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, X, Search, Inbox, FilterX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { HighlightText } from "@/components/HighlightText";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type { Person } from "@/types/person";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 15;

function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-surface/90 px-3 py-1.5 text-[11px] font-medium text-white/90 shadow-sm transition hover:border-primary/25">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-md p-0.5 text-muted transition hover:bg-white/10 hover:text-white"
        aria-label="Quitar filtro"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

export function PeopleListPage() {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const q = params.get("q") ?? "";
  const nombre = params.get("nombre") ?? "";
  const dni = params.get("dni") ?? "";
  const barrio = params.get("barrio") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);

  const [nombreLocal, setNombreLocal] = useState(nombre);
  const [dniLocal, setDniLocal] = useState(dni);
  const [barrioLocal, setBarrioLocal] = useState(barrio);

  useEffect(() => {
    setNombreLocal(nombre);
    setDniLocal(dni);
    setBarrioLocal(barrio);
  }, [nombre, dni, barrio]);

  const [items, setItems] = useState<Person[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErr(null);
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    sp.set("pageSize", String(PAGE_SIZE));
    if (q) sp.set("q", q);
    if (nombre) sp.set("nombre", nombre);
    if (dni) sp.set("dni", dni);
    if (barrio) sp.set("barrio", barrio);
    try {
      const data = (await apiFetch(`/people?${sp.toString()}`, { token })) as {
        items: Person[];
        total: number;
      };
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      if (e instanceof ApiError) setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, page, q, nombre, dni, barrio]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value && value.trim()) next.set(key, value.trim());
    else next.delete(key);
    next.delete("page");
    setParams(next);
  };

  const applyFilters = () => {
    const next = new URLSearchParams(params);
    if (nombreLocal.trim()) next.set("nombre", nombreLocal.trim());
    else next.delete("nombre");
    if (dniLocal.trim()) next.set("dni", dniLocal.trim());
    else next.delete("dni");
    if (barrioLocal.trim()) next.set("barrio", barrioLocal.trim());
    else next.delete("barrio");
    next.delete("page");
    setParams(next);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const highlightQuery = q || nombre || dni || barrio;
  const hasActiveFilters = Boolean(nombre || dni || barrio || q);

  const clearAllFilters = () => {
    setParams(new URLSearchParams());
    setNombreLocal("");
    setDniLocal("");
    setBarrioLocal("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personas"
        description="Listado denso, filtros tipo chip y búsqueda global desde la barra superior."
        action={
          <Link to="/people/new">
            <Button className="gap-2 rounded-xl px-5 py-2.5">
              <Plus className="h-4 w-4" />
              Agregar persona
            </Button>
          </Link>
        }
      />

      <Card className="p-5">
        <div className="mb-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted">
              Nombre
            </label>
            <Input
              value={nombreLocal}
              onChange={(e) => setNombreLocal(e.target.value)}
              placeholder="Nombre o apellido"
              className="rounded-xl py-2.5 text-[13px]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted">
              DNI
            </label>
            <Input
              value={dniLocal}
              onChange={(e) => setDniLocal(e.target.value)}
              placeholder="Sin puntos"
              className="rounded-xl py-2.5 text-[13px]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted">
              Barrio
            </label>
            <Input
              value={barrioLocal}
              onChange={(e) => setBarrioLocal(e.target.value)}
              placeholder="Barrio"
              className="rounded-xl py-2.5 text-[13px]"
            />
          </div>
          <div className="flex items-end">
            <Button type="button" className="w-full rounded-xl py-2.5" onClick={applyFilters}>
              Aplicar filtros
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {nombre ? (
            <Chip label={`Nombre: ${nombre}`} onRemove={() => updateParam("nombre", null)} />
          ) : null}
          {dni ? <Chip label={`DNI: ${dni}`} onRemove={() => updateParam("dni", null)} /> : null}
          {barrio ? (
            <Chip label={`Barrio: ${barrio}`} onRemove={() => updateParam("barrio", null)} />
          ) : null}
          {q ? (
            <Chip label={`Búsqueda: ${q}`} onRemove={() => updateParam("q", null)} />
          ) : null}
        </div>
      </Card>

      {err ? <p className="text-sm text-red-400">{err}</p> : null}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-[13px] leading-snug">
            <thead className="sticky top-0 z-10 border-b border-border bg-[#0c0c0c]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[#0c0c0c]/80">
              <tr className="text-[11px] uppercase tracking-wider text-muted">
                <th className="px-4 py-2.5 text-left font-semibold">Nombre completo</th>
                <th className="px-4 py-2.5 text-left font-semibold">DNI</th>
                <th className="px-4 py-2.5 text-left font-semibold">Edad</th>
                <th className="px-4 py-2.5 text-left font-semibold">Barrio</th>
                <th className="px-4 py-2.5 text-left font-semibold">Teléfono</th>
                <th className="px-4 py-2.5 text-left font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <span className="inline-flex items-center gap-2 text-[13px] text-muted">
                      <span className="h-4 w-4 animate-pulse rounded-full bg-primary/40" />
                      Cargando registros…
                    </span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-0">
                    <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
                      <div className="rounded-2xl border border-border bg-surface/60 p-4">
                        {hasActiveFilters ? (
                          <Search className="mx-auto h-8 w-8 text-muted" aria-hidden />
                        ) : (
                          <Inbox className="mx-auto h-8 w-8 text-muted" aria-hidden />
                        )}
                      </div>
                      <div className="max-w-md space-y-1">
                        <p className="text-[15px] font-medium text-white/95">
                          {hasActiveFilters ? "Sin coincidencias" : "No hay personas cargadas"}
                        </p>
                        <p className="text-[13px] leading-relaxed text-muted">
                          {hasActiveFilters
                            ? "Probá relajar filtros o limpiar la búsqueda para ver más resultados."
                            : "Creá el primer registro para comenzar a trabajar con el padrón."}
                        </p>
                      </div>
                      {hasActiveFilters ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2 rounded-xl"
                          onClick={clearAllFilters}
                        >
                          <FilterX className="h-4 w-4" />
                          Limpiar filtros
                        </Button>
                      ) : (
                        <Link to="/people/new">
                          <Button className="rounded-xl">Agregar persona</Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr
                    key={p.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate(`/people/${p.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") navigate(`/people/${p.id}`);
                    }}
                    className={cn(
                      "cursor-pointer border-b border-border/35 transition-colors duration-150",
                      "hover:bg-white/[0.045]"
                    )}
                  >
                    <td className="px-4 py-2.5 font-medium text-white/95">
                      <HighlightText
                        text={`${p.apellido}, ${p.nombre}`}
                        query={highlightQuery}
                      />
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-muted">
                      <HighlightText text={p.dni} query={highlightQuery} />
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-muted">{p.edad}</td>
                    <td className="px-4 py-2.5 text-muted">
                      <HighlightText text={p.barrio ?? "—"} query={highlightQuery} />
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-muted">{p.telefono ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium",
                          p.activo
                            ? "border-emerald-500/25 bg-emerald-500/12 text-emerald-300"
                            : "border-white/10 bg-white/[0.06] text-muted"
                        )}
                      >
                        {p.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border bg-white/[0.02] px-4 py-2.5 text-[12px] text-muted">
          <span>
            {total} registro{total === 1 ? "" : "s"} · Página {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-1 rounded-lg px-2 py-1.5"
              disabled={page <= 1}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set("page", String(page - 1));
                setParams(next);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="gap-1 rounded-lg px-2 py-1.5"
              disabled={page >= totalPages}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set("page", String(page + 1));
                setParams(next);
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
