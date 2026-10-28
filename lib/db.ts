import { neon } from "@neondatabase/serverless";

// Conexión a Postgres (Neon, integración de Vercel). El prefijo configurado
// es DATABASE, pero se aceptan los nombres alternativos que la integración
// puede crear según la versión.
function urlBaseDatos(): string | null {
  const candidatos = [
    "DATABASE_URL",
    "DATABASE_PRISMA_URL",
    "DATABASE_URL_UNPOOLED",
    "DATABASE_POSTGRES_URL",
    "POSTGRES_URL",
    "POSTGRES_PRISMA_URL",
    "STORAGE_URL",
  ];
  for (const k of candidatos) {
    const v = process.env[k];
    if (v && v.startsWith("postgres")) return v;
  }
  return null;
}

export function bdDisponible() {
  return urlBaseDatos() !== null;
}

let cliente: ReturnType<typeof neon> | null = null;
function getSql() {
  if (!cliente) {
    const url = urlBaseDatos();
    if (!url) throw new Error("Base de datos no configurada (DATABASE_URL)");
    // El driver HTTP de Neon consulta con fetch(), y Next 14 guarda en su
    // caché de datos (sin caducidad) los fetch de las rutas GET que no leen
    // cookies, aunque declaren `dynamic = "force-dynamic"`. Le pasaba a la
    // vista del equipo y a la exportación de CSV: devolvían datos viejos.
    // `no-store` aquí desactiva esa caché para todas las consultas.
    cliente = neon(url, { fetchOptions: { cache: "no-store" } });
  }
  return cliente;
}

// Esquema idempotente: se asegura una vez por proceso.
let esquemaListo: Promise<void> | null = null;
export function asegurarEsquema(): Promise<void> {
  if (!esquemaListo) {
    esquemaListo = (async () => {
      const sql = getSql();
      await sql`CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        correo TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        edad TEXT,
        ocupacion TEXT,
        correccion TEXT,
        horas_pantalla INT DEFAULT 6,
        intervalo_min INT DEFAULT 60,
        recordatorios_activos BOOLEAN DEFAULT TRUE,
        consentimiento BOOLEAN DEFAULT FALSE,
        creado TIMESTAMPTZ DEFAULT now()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS bloques (
        id SERIAL PRIMARY KEY,
        usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
        dia INT NOT NULL,
        inicio INT NOT NULL,
        fin INT NOT NULL
      )`;
      await sql`CREATE TABLE IF NOT EXISTS cvsq (
        id SERIAL PRIMARY KEY,
        usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
        puntaje INT NOT NULL,
        respuestas JSONB,
        fecha TIMESTAMPTZ DEFAULT now()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS cumplimientos (
        id SERIAL PRIMARY KEY,
        usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
        ejercicio_id TEXT NOT NULL,
        fuente TEXT DEFAULT 'app',
        fecha TIMESTAMPTZ DEFAULT now()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS mensajes (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        correo TEXT NOT NULL,
        mensaje TEXT NOT NULL,
        creado TIMESTAMPTZ DEFAULT now()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS envios (
        id SERIAL PRIMARY KEY,
        usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
        fecha_dia DATE NOT NULL,
        hora TEXT NOT NULL,
        ejercicio_id TEXT,
        creado TIMESTAMPTZ DEFAULT now(),
        UNIQUE (usuario_id, fecha_dia, hora)
      )`;
      // Evaluación final del estudio (seis semanas): escala SUS, una por
      // estudiante, y marca de qué medición del CVS-Q es la inicial y cuál
      // la final, para que el análisis pre/post no dependa de adivinar fechas.
      await sql`CREATE TABLE IF NOT EXISTS sus (
        id SERIAL PRIMARY KEY,
        usuario_id INT UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
        puntaje NUMERIC(5,1) NOT NULL,
        respuestas JSONB NOT NULL,
        fecha TIMESTAMPTZ DEFAULT now()
      )`;
      await sql`ALTER TABLE cvsq ADD COLUMN IF NOT EXISTS momento TEXT`;
      await sql`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cierre_enviado TIMESTAMPTZ`;
      await sql`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cierre_recordado TIMESTAMPTZ`;
    })();
  }
  return esquemaListo;
}

export async function db() {
  await asegurarEsquema();
  return getSql();
}

// Hora local de Colombia (America/Bogota, UTC-5 fijo, sin horario de verano).
export function ahoraBogota() {
  const d = new Date(Date.now() - 5 * 3600 * 1000);
  const dia = (d.getUTCDay() + 6) % 7; // Lunes = 0
  const minutos = d.getUTCHours() * 60 + d.getUTCMinutes();
  const fecha = d.toISOString().slice(0, 10); // YYYY-MM-DD local
  return { dia, minutos, fecha };
}
