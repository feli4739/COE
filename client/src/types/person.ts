export interface Person {
  id: string;
  legajo: string | null;
  apellido: string;
  nombre: string;
  dni: string;
  fecha_nacimiento: string;
  edad: number;
  sexo: string | null;
  grupo_sanguineo: string | null;
  patologia_base: string | null;
  observaciones_medicas: string | null;
  email: string | null;
  telefono: string | null;
  contacto_emergencia: string | null;
  barrio: string | null;
  calle: string | null;
  numero: string | null;
  primario: string | null;
  secundario: string | null;
  terciario: string | null;
  anio_egreso: number | null;
  oficio: string | null;
  coordinador: string | null;
  antiguedad: string | null;
  ayuda_economica: boolean;
  ayuda_materiales: boolean;
  otros_beneficios: string | null;
  capacitaciones: string | null;
  medio_movilidad: boolean;
  licencias: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalPersonas: number;
  nuevosIngresos: number;
  conPatologias: number;
  newPeopleDays: number;
}
