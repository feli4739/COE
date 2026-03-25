-- FireBurst People — esquema PostgreSQL
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legajo TEXT UNIQUE,
  apellido TEXT NOT NULL,
  nombre TEXT NOT NULL,
  dni TEXT NOT NULL UNIQUE,
  fecha_nacimiento DATE NOT NULL,
  sexo TEXT,
  grupo_sanguineo TEXT,
  patologia_base TEXT,
  observaciones_medicas TEXT,
  email TEXT,
  telefono TEXT,
  contacto_emergencia TEXT,
  barrio TEXT,
  calle TEXT,
  numero TEXT,
  primario TEXT,
  secundario TEXT,
  terciario TEXT,
  anio_egreso INTEGER,
  oficio TEXT,
  coordinador TEXT,
  antiguedad TEXT,
  ayuda_economica BOOLEAN NOT NULL DEFAULT false,
  ayuda_materiales BOOLEAN NOT NULL DEFAULT false,
  otros_beneficios TEXT,
  capacitaciones TEXT,
  medio_movilidad BOOLEAN NOT NULL DEFAULT false,
  licencias TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_people_dni ON people (dni);
CREATE INDEX idx_people_barrio ON people (barrio);
CREATE INDEX idx_people_created ON people (created_at DESC);
CREATE INDEX idx_people_nombre_apellido ON people (lower(nombre), lower(apellido));
CREATE INDEX idx_people_activo ON people (activo);
