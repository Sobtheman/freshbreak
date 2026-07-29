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
    cliente = neon(url);
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
      await sql`CREATE TABLE IF NOT EXISTS envios (
        id SERIAL PRIMARY KEY,
        usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
        fecha_dia DATE NOT NULL,
        hora TEXT NOT NULL,
        ejercicio_id TEXT,
        creado TIMESTAMPTZ DEFAULT now(),
        UNIQUE (usuario_id, fecha_dia, hora)
      )`;
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
