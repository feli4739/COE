import { pool } from "../db/pool.js";
import { config } from "../config.js";

export async function getDashboardStats() {
  const days = config.newPeopleDays;
  const { rows } = await pool.query(
    `
    SELECT
      (SELECT count(*)::int FROM people WHERE activo = true) AS total_personas,
      (
        SELECT count(*)::int FROM people
        WHERE activo = true
          AND created_at >= now() - ($1::int * interval '1 day')
      ) AS nuevos_ingresos,
      (
        SELECT count(*)::int FROM people
        WHERE activo = true
          AND patologia_base IS NOT NULL
          AND trim(patologia_base) <> ''
      ) AS con_patologias
    `,
    [String(days)]
  );
  const r = rows[0] as {
    total_personas: number;
    nuevos_ingresos: number;
    con_patologias: number;
  };
  return {
    totalPersonas: r.total_personas,
    nuevosIngresos: r.nuevos_ingresos,
    conPatologias: r.con_patologias,
    newPeopleDays: days,
  };
}
