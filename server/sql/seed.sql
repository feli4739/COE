-- Datos de ejemplo (personas). Los usuarios se insertan vía script Node (bcrypt).
-- Ejecutar después de schema.sql

INSERT INTO people (
  legajo, apellido, nombre, dni, fecha_nacimiento, sexo,
  grupo_sanguineo, patologia_base, observaciones_medicas,
  email, telefono, contacto_emergencia,
  barrio, calle, numero,
  primario, secundario, terciario, anio_egreso,
  oficio, coordinador, antiguedad,
  ayuda_economica, ayuda_materiales, otros_beneficios,
  capacitaciones, medio_movilidad, licencias,
  activo, created_at
) VALUES
(
  'L-1001', 'García', 'María', '30123456', '1990-05-12', 'Femenino',
  'O+', 'Diabetes tipo 2', 'Control glucémico semestral',
  'maria.garcia@example.com', '11-5555-1001', 'Juan García (esposo)',
  'Centro', 'San Martín', '1200',
  'Completo', 'Completo', 'Abogacía', 2015,
  'Administrativa', 'López, Ana', '8 años',
  true, false, 'Subsidio transporte',
  'Excel avanzado', true, 'B categoría',
  true, now() - interval '5 days'
),
(
  'L-1002', 'Fernández', 'Lucas', '35111222', '1988-11-03', 'Masculino',
  'A+', NULL, NULL,
  'lucas.f@example.com', '11-4444-2002', 'Laura Fernández (hermana)',
  'Norte', 'Mitre', '450',
  'Completo', 'Completo', NULL, NULL,
  'Operario', 'Martínez, Carlos', '12 años',
  false, true, NULL,
  'Seguridad e higiene', false, NULL,
  true, now() - interval '12 days'
),
(
  'L-1003', 'Rodríguez', 'Paula', '38222333', '1995-02-20', 'Femenino',
  'B-', 'Hipertensión', 'En tratamiento',
  'p.rodriguez@example.com', '11-3333-3003', 'Mamá: 11-2222-0000',
  'Sur', 'Rivadavia', '88',
  'Completo', 'Completo', 'Trabajo social', 2018,
  'Trabajadora social', 'López, Ana', '4 años',
  true, true, 'Útiles escolares hijos',
  'Primeros auxilios', true, NULL,
  true, now() - interval '2 days'
),
(
  'L-1004', 'Martínez', 'Diego', '28987654', '1985-07-30', 'Masculino',
  'AB+', NULL, NULL,
  'd.martinez@example.com', '11-6666-4004', 'Sofía Martínez',
  'Oeste', 'Corrientes', '2100',
  'Completo', 'Completo', 'Ingeniería', 2010,
  'Ingeniero', 'Pérez, Roberto', '14 años',
  false, false, NULL,
  'Project management', false, 'Profesional',
  true, now() - interval '45 days'
),
(
  'L-1005', 'López', 'Ana', '31234567', '1992-09-15', 'Femenino',
  'O-', NULL, NULL,
  'ana.lopez@example.com', '11-7777-5005', 'Pedro López',
  'Centro', 'Belgrano', '300',
  'Completo', 'Completo', 'Psicología', 2016,
  'Coordinadora', 'Dirección general', '9 años',
  true, false, NULL,
  'Liderazgo', true, 'B categoría',
  true, now() - interval '60 days'
),
(
  'L-1006', 'Sánchez', 'Julián', '40123456', '1998-04-08', 'Masculino',
  'A-', NULL, NULL,
  'julian.s@example.com', '11-8888-6006', 'María Sánchez',
  'Este', 'Independencia', '55',
  'Completo', 'Completo', NULL, NULL,
  'Auxiliar', 'López, Ana', '1 año',
  false, true, NULL,
  'Inducción general', false, NULL,
  true, now() - interval '8 days'
),
(
  'L-1007', 'Gómez', 'Carla', '37112233', '1991-12-01', 'Femenino',
  'B+', 'Asma leve', 'Inhalador en cartera',
  'carla.gomez@example.com', '11-9999-7007', 'Diego Gómez',
  'Norte', 'Urquiza', '700',
  'Completo', 'Completo', 'Contador', 2014,
  'Contadora', 'Pérez, Roberto', '10 años',
  true, false, NULL,
  'AFIP básico', true, NULL,
  true, now() - interval '20 days'
),
(
  'L-1008', 'Pérez', 'Roberto', '25678901', '1980-03-22', 'Masculino',
  'O+', NULL, NULL,
  'r.perez@example.com', '11-1010-8008', 'Laura Pérez',
  'Sur', 'Laprida', '400',
  'Completo', 'Completo', 'MBA', 2008,
  'Gerente', 'Dirección general', '18 años',
  false, false, 'Viáticos',
  'Negociación', true, 'B categoría',
  true, now() - interval '90 days'
),
(
  'L-1009', 'Torres', 'Natalia', '38999001', '1994-06-18', 'Femenino',
  'A+', NULL, NULL,
  'natalia.t@example.com', '11-1212-9009', 'Mamá',
  'Oeste', 'Sarmiento', '1500',
  'Completo', 'Completo', 'Diseño', 2017,
  'Diseñadora', 'López, Ana', '5 años',
  true, true, NULL,
  'Figma avanzado', false, NULL,
  true, now() - interval '3 days'
),
(
  'L-1010', 'Ruiz', 'Martín', '33445566', '1987-10-10', 'Masculino',
  'B-', NULL, NULL,
  'martin.ruiz@example.com', '11-1313-1010', 'Sofía Ruiz',
  'Centro', 'Paraná', '220',
  'Completo', 'Completo', NULL, NULL,
  'Chofer', 'Martínez, Carlos', '11 años',
  false, false, NULL,
  'Manejo defensivo', true, 'D categoría',
  true, now() - interval '35 days'
),
(
  'L-1011', 'Vega', 'Silvia', '29887766', '1983-01-25', 'Femenino',
  'AB-', 'Artritis', 'Sesiones fisioterapia',
  'silvia.vega@example.com', '11-1414-1111', 'Hijo: 11-1515-1212',
  'Este', 'Córdoba', '900',
  'Completo', 'Completo', 'Enfermería', 2006,
  'Enfermera', 'López, Ana', '16 años',
  true, false, NULL,
  'RCP', true, NULL,
  true, now() - interval '15 days'
),
(
  'L-1012', 'Castro', 'Leo', '41223344', '1999-08-05', 'Masculino',
  'O+', NULL, NULL,
  'leo.castro@example.com', '11-1616-1313', 'Papá',
  'Norte', 'Saavedra', '120',
  'Completo', 'Completo', 'Análisis de datos', 2022,
  'Analista', 'Pérez, Roberto', '2 años',
  false, true, NULL,
  'Python', false, NULL,
  true, now() - interval '1 day'
),
(
  'L-1013', 'Morales', 'Elena', '36554433', '1990-11-30', 'Femenino',
  'A-', NULL, NULL,
  'elena.m@example.com', '11-1717-1414', 'Esposo',
  'Sur', 'Chacabuco', '600',
  'Completo', 'Completo', 'Profesorado', 2013,
  'Docente taller', 'Martínez, Carlos', '7 años',
  true, false, NULL,
  'Didáctica', false, NULL,
  true, now() - interval '70 days'
),
(
  'L-1014', 'Ibáñez', 'Federico', '32110099', '1989-04-14', 'Masculino',
  'B+', NULL, NULL,
  'fede.i@example.com', '11-1818-1515', 'Hermana',
  'Oeste', 'Entre Ríos', '3300',
  'Completo', 'Completo', 'Comunicación', 2012,
  'Comunicación', 'López, Ana', '11 años',
  false, false, NULL,
  'Redes sociales', true, NULL,
  false, now() - interval '100 days'
),
(
  'L-1015', 'Navarro', 'Cecilia', '37889900', '1993-07-07', 'Femenino',
  'O-', 'Migraña', 'Evitar estrés prolongado',
  'cecilia.n@example.com', '11-1919-1616', 'Pareja',
  'Centro', 'Tucumán', '500',
  'Completo', 'Completo', 'RRHH', 2019,
  'RRHH', 'Pérez, Roberto', '4 años',
  true, true, NULL,
  'Selección por competencias', false, NULL,
  true, now() - interval '6 days'
);
