import type { PersonFormValues } from "./personSchema";

/** Convierte strings vacíos a null para el API */
export function toPersonPayload(v: PersonFormValues): Record<string, unknown> {
  const str = (s: string | undefined) => (s?.trim() ? s.trim() : null);
  return {
    legajo: str(v.legajo ?? ""),
    apellido: v.apellido.trim(),
    nombre: v.nombre.trim(),
    dni: v.dni.trim(),
    fecha_nacimiento: v.fecha_nacimiento,
    sexo: str(v.sexo ?? ""),
    grupo_sanguineo: str(v.grupo_sanguineo ?? ""),
    patologia_base: str(v.patologia_base ?? ""),
    observaciones_medicas: str(v.observaciones_medicas ?? ""),
    email: str(v.email ?? ""),
    telefono: str(v.telefono ?? ""),
    contacto_emergencia: str(v.contacto_emergencia ?? ""),
    barrio: str(v.barrio ?? ""),
    calle: str(v.calle ?? ""),
    numero: str(v.numero ?? ""),
    primario: str(v.primario ?? ""),
    secundario: str(v.secundario ?? ""),
    terciario: str(v.terciario ?? ""),
    anio_egreso: v.anio_egreso ?? null,
    oficio: str(v.oficio ?? ""),
    coordinador: str(v.coordinador ?? ""),
    antiguedad: str(v.antiguedad ?? ""),
    ayuda_economica: v.ayuda_economica,
    ayuda_materiales: v.ayuda_materiales,
    otros_beneficios: str(v.otros_beneficios ?? ""),
    capacitaciones: str(v.capacitaciones ?? ""),
    medio_movilidad: v.medio_movilidad,
    licencias: str(v.licencias ?? ""),
    activo: v.activo,
  };
}

export function personToFormValues(p: import("@/types/person").Person): PersonFormValues {
  const d = p.fecha_nacimiento.includes("T")
    ? p.fecha_nacimiento.slice(0, 10)
    : p.fecha_nacimiento;
  return {
    legajo: p.legajo ?? "",
    apellido: p.apellido,
    nombre: p.nombre,
    dni: p.dni,
    fecha_nacimiento: d,
    sexo: p.sexo ?? "",
    grupo_sanguineo: p.grupo_sanguineo ?? "",
    patologia_base: p.patologia_base ?? "",
    observaciones_medicas: p.observaciones_medicas ?? "",
    email: p.email ?? "",
    telefono: p.telefono ?? "",
    contacto_emergencia: p.contacto_emergencia ?? "",
    barrio: p.barrio ?? "",
    calle: p.calle ?? "",
    numero: p.numero ?? "",
    primario: p.primario ?? "",
    secundario: p.secundario ?? "",
    terciario: p.terciario ?? "",
    anio_egreso: p.anio_egreso ?? undefined,
    oficio: p.oficio ?? "",
    coordinador: p.coordinador ?? "",
    antiguedad: p.antiguedad ?? "",
    ayuda_economica: p.ayuda_economica,
    ayuda_materiales: p.ayuda_materiales,
    otros_beneficios: p.otros_beneficios ?? "",
    capacitaciones: p.capacitaciones ?? "",
    medio_movilidad: p.medio_movilidad,
    licencias: p.licencias ?? "",
    activo: p.activo,
  };
}
