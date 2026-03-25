import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  User,
  Briefcase,
  GraduationCap,
  Gift,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type { Person } from "@/types/person";

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
        <Icon className="h-4 w-4 text-primary" />
        <CardTitle>{title}</CardTitle>
      </div>
      <div className="grid gap-3 text-sm md:grid-cols-2">{children}</div>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="font-medium text-white">{value ?? "—"}</p>
    </div>
  );
}

export function PersonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const [p, setP] = useState<Person | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    let c = false;
    (async () => {
      try {
        const data = (await apiFetch(`/people/${id}`, { token })) as Person;
        if (!c) setP(data);
      } catch (e) {
        if (!c && e instanceof ApiError) setErr(e.message);
      }
    })();
    return () => {
      c = true;
    };
  }, [token, id]);

  const onDelete = async () => {
    if (!token || !id || !confirm("¿Dar de baja a esta persona? (quedará inactiva)")) return;
    setDeleting(true);
    try {
      await apiFetch(`/people/${id}`, { method: "DELETE", token });
      navigate("/people");
    } catch (e) {
      if (e instanceof ApiError) setErr(e.message);
    } finally {
      setDeleting(false);
    }
  };

  if (err && !p) {
    return <p className="text-red-400">{err}</p>;
  }
  if (!p) {
    return <p className="text-muted">Cargando…</p>;
  }

  const fullName = `${p.apellido}, ${p.nombre}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/people"
            className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            Volver al listado
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{fullName}</h1>
            <Badge variant={p.activo ? "success" : "muted"}>
              {p.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            Legajo {p.legajo ?? "—"} · DNI{" "}
            <span className="font-semibold text-white">{p.dni}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/people/${p.id}/edit`}>
            <Button className="gap-2">
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Button variant="danger" disabled={deleting} onClick={onDelete}>
            {deleting ? "Procesando…" : "Dar de baja"}
          </Button>
        </div>
      </div>

      <Card className="border-primary/25 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs text-muted">Teléfono</p>
              <p className="text-lg font-semibold">{p.telefono ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs text-muted">Email</p>
              <p className="text-lg font-semibold break-all">{p.email ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs text-muted">DNI</p>
              <p className="text-lg font-semibold">{p.dni}</p>
            </div>
          </div>
        </div>
      </Card>

      <Section title="Datos personales" icon={User}>
        <Field label="Legajo" value={p.legajo} />
        <Field label="Nombre" value={p.nombre} />
        <Field label="Apellido" value={p.apellido} />
        <Field label="Fecha de nacimiento" value={p.fecha_nacimiento?.slice(0, 10)} />
        <Field label="Edad" value={p.edad} />
        <Field label="Sexo" value={p.sexo} />
      </Section>

      <Section title="Información médica" icon={Stethoscope}>
        <Field label="Grupo sanguíneo" value={p.grupo_sanguineo} />
        <Field label="Patología base" value={p.patologia_base} />
        <Field label="Observaciones" value={p.observaciones_medicas} />
      </Section>

      <Section title="Contacto" icon={Phone}>
        <Field label="Email" value={p.email} />
        <Field label="Teléfono" value={p.telefono} />
        <Field label="Contacto de emergencia" value={p.contacto_emergencia} />
      </Section>

      <Section title="Dirección" icon={MapPin}>
        <Field label="Barrio" value={p.barrio} />
        <Field label="Calle" value={p.calle} />
        <Field label="Número" value={p.numero} />
      </Section>

      <Section title="Educación" icon={GraduationCap}>
        <Field label="Primario" value={p.primario} />
        <Field label="Secundario" value={p.secundario} />
        <Field label="Terciario" value={p.terciario} />
        <Field label="Año de egreso" value={p.anio_egreso} />
      </Section>

      <Section title="Información laboral" icon={Briefcase}>
        <Field label="Oficio" value={p.oficio} />
        <Field label="Coordinador" value={p.coordinador} />
        <Field label="Antigüedad" value={p.antiguedad} />
      </Section>

      <Section title="Beneficios" icon={Gift}>
        <Field label="Ayuda económica" value={p.ayuda_economica ? "Sí" : "No"} />
        <Field label="Ayuda materiales" value={p.ayuda_materiales ? "Sí" : "No"} />
        <Field label="Otros" value={p.otros_beneficios} />
      </Section>

      <Section title="Otros" icon={Car}>
        <Field label="Capacitaciones" value={p.capacitaciones} />
        <Field label="Medio de movilidad" value={p.medio_movilidad ? "Sí" : "No"} />
        <Field label="Licencias" value={p.licencias} />
      </Section>
    </div>
  );
}
