import dotenv from "dotenv";

dotenv.config();

function req(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === "") {
    throw new Error(`Missing env: ${name}`);
  }
  return v;
}

export const config = {
  databaseUrl: req("DATABASE_URL"),
  jwtSecret: req("JWT_SECRET"),
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  /** Ventana en días para KPI "nuevos ingresos" */
  newPeopleDays: Number(process.env.NEW_PEOPLE_DAYS ?? 30),
};
