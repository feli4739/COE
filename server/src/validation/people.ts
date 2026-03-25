import { z } from "zod";

/** Validación compartida create/update (PUT permite parciales en plan; usamos mismo objeto completo) */
export const personBodySchema = z.object({
  legajo: z.string().trim().max(64).optional().nullable(),
  apellido: z.string().trim().min(1, "Requerido").max(200),
  nombre: z.string().trim().min(1, "Requerido").max(200),
  dni: z.string().trim().min(6, "DNI inválido").max(32),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD"),
  sexo: z.string().max(50).optional().nullable(),
  grupo_sanguineo: z.string().max(20).optional().nullable(),
  patologia_base: z.string().max(2000).optional().nullable(),
  observaciones_medicas: z.string().max(5000).optional().nullable(),
  email: z.string().max(320).optional().nullable(),
  telefono: z.string().max(64).optional().nullable(),
  contacto_emergencia: z.string().max(500).optional().nullable(),
  barrio: z.string().max(200).optional().nullable(),
  calle: z.string().max(200).optional().nullable(),
  numero: z.string().max(50).optional().nullable(),
  primario: z.string().max(200).optional().nullable(),
  secundario: z.string().max(200).optional().nullable(),
  terciario: z.string().max(200).optional().nullable(),
  anio_egreso: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  oficio: z.string().max(200).optional().nullable(),
  coordinador: z.string().max(200).optional().nullable(),
  antiguedad: z.string().max(200).optional().nullable(),
  ayuda_economica: z.boolean(),
  ayuda_materiales: z.boolean(),
  otros_beneficios: z.string().max(2000).optional().nullable(),
  capacitaciones: z.string().max(5000).optional().nullable(),
  medio_movilidad: z.boolean(),
  licencias: z.string().max(500).optional().nullable(),
  activo: z.boolean().optional(),
});

export type PersonBody = z.infer<typeof personBodySchema>;
