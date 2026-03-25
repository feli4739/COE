import { pool } from "../db/pool.js";
import type { PersonBody } from "../validation/people.js";

const selectFields = `
  p.id,
  p.legajo,
  p.apellido,
  p.nombre,
  p.dni,
  p.fecha_nacimiento,
  EXTRACT(YEAR FROM age(p.fecha_nacimiento))::int AS edad,
  p.sexo,
  p.grupo_sanguineo,
  p.patologia_base,
  p.observaciones_medicas,
  p.email,
  p.telefono,
  p.contacto_emergencia,
  p.barrio,
  p.calle,
  p.numero,
  p.primario,
  p.secundario,
  p.terciario,
  p.anio_egreso,
  p.oficio,
  p.coordinador,
  p.antiguedad,
  p.ayuda_economica,
  p.ayuda_materiales,
  p.otros_beneficios,
  p.capacitaciones,
  p.medio_movilidad,
  p.licencias,
  p.activo,
  p.created_at,
  p.updated_at
`;

/** Convierte strings vacíos en null para columnas nullable */
function normalizeStrings(row: Record<string, unknown>): Record<string, unknown> {
  const out = { ...row };
  for (const k of Object.keys(out)) {
    if (out[k] === "") out[k] = null;
  }
  return out;
}

export interface ListParams {
  page: number;
  pageSize: number;
  q?: string;
  nombre?: string;
  dni?: string;
  barrio?: string;
  activo?: boolean;
}

export async function listPeople(params: ListParams) {
  const { page, pageSize, q, nombre, dni, barrio, activo } = params;
  const offset = (page - 1) * pageSize;
  const conditions: string[] = ["1=1"];
  const whereValues: unknown[] = [];
  let i = 1;

  if (q && q.trim()) {
    const term = `%${q.trim()}%`;
    whereValues.push(term);
    conditions.push(
      `(p.nombre ILIKE $${i} OR p.apellido ILIKE $${i} OR p.dni ILIKE $${i} OR COALESCE(p.barrio,'') ILIKE $${i} OR (p.nombre || ' ' || p.apellido) ILIKE $${i})`
    );
    i++;
  }
  if (nombre?.trim()) {
    const term = `%${nombre.trim()}%`;
    whereValues.push(term);
    conditions.push(`(p.nombre ILIKE $${i} OR p.apellido ILIKE $${i})`);
    i++;
  }
  if (dni?.trim()) {
    whereValues.push(`%${dni.trim()}%`);
    conditions.push(`p.dni ILIKE $${i}`);
    i++;
  }
  if (barrio?.trim()) {
    whereValues.push(`%${barrio.trim()}%`);
    conditions.push(`p.barrio ILIKE $${i}`);
    i++;
  }
  if (activo !== undefined) {
    whereValues.push(activo);
    conditions.push(`p.activo = $${i}`);
    i++;
  }

  const where = conditions.join(" AND ");
  const limitIdx = i;
  const offsetIdx = i + 1;
  const listValues = [...whereValues, pageSize, offset];

  const countSql = `SELECT count(*)::int AS c FROM people p WHERE ${where}`;
  const listSql = `
    SELECT ${selectFields}
    FROM people p
    WHERE ${where}
    ORDER BY p.apellido ASC, p.nombre ASC
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `;

  const { rows: countRows } = await pool.query(countSql, whereValues);
  const total = (countRows[0] as { c: number })?.c ?? 0;

  const { rows: items } = await pool.query(listSql, listValues);
  return { items, total, page };
}

export async function getPersonById(id: string) {
  const { rows } = await pool.query(
    `SELECT ${selectFields} FROM people p WHERE p.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

const insertCols = [
  "legajo",
  "apellido",
  "nombre",
  "dni",
  "fecha_nacimiento",
  "sexo",
  "grupo_sanguineo",
  "patologia_base",
  "observaciones_medicas",
  "email",
  "telefono",
  "contacto_emergencia",
  "barrio",
  "calle",
  "numero",
  "primario",
  "secundario",
  "terciario",
  "anio_egreso",
  "oficio",
  "coordinador",
  "antiguedad",
  "ayuda_economica",
  "ayuda_materiales",
  "otros_beneficios",
  "capacitaciones",
  "medio_movilidad",
  "licencias",
  "activo",
] as const;

function rowValues(body: PersonBody & { activo?: boolean }): unknown[] {
  const b = normalizeStrings(body as unknown as Record<string, unknown>) as PersonBody & {
    activo?: boolean;
  };
  return [
    b.legajo ?? null,
    b.apellido,
    b.nombre,
    b.dni,
    b.fecha_nacimiento,
    b.sexo ?? null,
    b.grupo_sanguineo ?? null,
    b.patologia_base ?? null,
    b.observaciones_medicas ?? null,
    b.email ?? null,
    b.telefono ?? null,
    b.contacto_emergencia ?? null,
    b.barrio ?? null,
    b.calle ?? null,
    b.numero ?? null,
    b.primario ?? null,
    b.secundario ?? null,
    b.terciario ?? null,
    b.anio_egreso ?? null,
    b.oficio ?? null,
    b.coordinador ?? null,
    b.antiguedad ?? null,
    b.ayuda_economica,
    b.ayuda_materiales,
    b.otros_beneficios ?? null,
    b.capacitaciones ?? null,
    b.medio_movilidad,
    b.licencias ?? null,
    b.activo ?? true,
  ];
}

export async function createPerson(body: PersonBody) {
  const placeholders = insertCols.map((_, idx) => `$${idx + 1}`).join(", ");
  const sql = `
    INSERT INTO people (${insertCols.join(", ")})
    VALUES (${placeholders})
    RETURNING id
  `;
  const vals = rowValues({ ...body, activo: body.activo ?? true });
  const { rows } = await pool.query(sql, vals);
  return rows[0]?.id as string;
}

export async function updatePerson(id: string, body: PersonBody) {
  const sets = insertCols.map((c, idx) => `${c} = $${idx + 1}`).join(", ");
  const vals = [...rowValues(body), id];
  const sql = `
    UPDATE people SET ${sets}, updated_at = now()
    WHERE id = $${vals.length}
    RETURNING id
  `;
  const { rowCount } = await pool.query(sql, vals);
  return rowCount ?? 0;
}

/** Soft delete: marca inactivo */
export async function softDeletePerson(id: string) {
  const { rowCount } = await pool.query(
    `UPDATE people SET activo = false, updated_at = now() WHERE id = $1`,
    [id]
  );
  return rowCount ?? 0;
}
