import { z } from "zod";

/** Espejo de validación servidor + mensajes en español para el formulario */
export const personFormSchema = z.object({
  legajo: z.string().max(64).optional(),
  apellido: z.string().min(1, "Requerido").max(200),
  nombre: z.string().min(1, "Requerido").max(200),
  dni: z.string().min(6, "DNI inválido").max(32),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  sexo: z.string().max(50).optional(),
  grupo_sanguineo: z.string().max(20).optional(),
  patologia_base: z.string().max(2000).optional(),
  observaciones_medicas: z.string().max(5000).optional(),
  email: z
    .string()
    .max(320)
    .optional()
    .refine((v) => !v || v === "" || z.string().email().safeParse(v).success, {
      message: "Email inválido",
    }),
  telefono: z.string().max(64).optional(),
  contacto_emergencia: z.string().max(500).optional(),
  barrio: z.string().max(200).optional(),
  calle: z.string().max(200).optional(),
  numero: z.string().max(50).optional(),
  primario: z.string().max(200).optional(),
  secundario: z.string().max(200).optional(),
  terciario: z.string().max(200).optional(),
  anio_egreso: z.preprocess((v) => {
    if (v === "" || v === undefined || v === null) return undefined;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : undefined;
  }, z.number().int().min(1900).max(2100).optional()),
  oficio: z.string().max(200).optional(),
  coordinador: z.string().max(200).optional(),
  antiguedad: z.string().max(200).optional(),
  ayuda_economica: z.boolean(),
  ayuda_materiales: z.boolean(),
  otros_beneficios: z.string().max(2000).optional(),
  capacitaciones: z.string().max(5000).optional(),
  medio_movilidad: z.boolean(),
  licencias: z.string().max(500).optional(),
  activo: z.boolean(),
});

export type PersonFormValues = z.infer<typeof personFormSchema>;

export const defaultPersonValues: PersonFormValues = {
  legajo: "",
  apellido: "",
  nombre: "",
  dni: "",
  fecha_nacimiento: "",
  sexo: "",
  grupo_sanguineo: "",
  patologia_base: "",
  observaciones_medicas: "",
  email: "",
  telefono: "",
  contacto_emergencia: "",
  barrio: "",
  calle: "",
  numero: "",
  primario: "",
  secundario: "",
  terciario: "",
  anio_egreso: undefined,
  oficio: "",
  coordinador: "",
  antiguedad: "",
  ayuda_economica: false,
  ayuda_materiales: false,
  otros_beneficios: "",
  capacitaciones: "",
  medio_movilidad: false,
  licencias: "",
  activo: true,
};
