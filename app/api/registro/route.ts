import { NextResponse } from "next/server";
import { bdDisponible, db } from "@/lib/db";
import { crearSesion } from "@/lib/session";

// Crea (o actualiza, si el correo ya existe) al estudiante y abre sesión.
// Requiere el consentimiento de tratamiento de datos (Ley 1581 de 2012).
export async function POST(req: Request) {
  if (!bdDisponible()) {
    return NextResponse.json(
      { ok: false, error: "Base de datos no configurada" },
      { status: 503 }
    );
  }
  let body: {
    correo?: string;
    nombre?: string;
    edad?: string;
    ocupacion?: string;
    correccion?: string;
    consentimiento?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }
  const correo = body.correo?.trim().toLowerCase();
  const nombre = body.nombre?.trim();
  if (!correo || !nombre) {
    return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 });
  }
  if (!body.consentimiento) {
    return NextResponse.json(
      { ok: false, error: "Se requiere autorizar el tratamiento de datos" },
      { status: 400 }
    );
  }

  try {
    const sql = await db();
    // Si el correo ya tiene cuenta NO se abre sesión con solo conocerlo:
    // eso permitiría suplantar a otra persona. El dueño entra por su
    // enlace mágico (/entrar), que sí verifica el acceso al buzón.
    const existentes = (await sql`
      SELECT id FROM usuarios WHERE correo = ${correo}
    `) as { id: number }[];
    if (existentes.length) {
      return NextResponse.json(
        { ok: false, code: "cuenta_existente", error: "Este correo ya tiene una cuenta" },
        { status: 409 }
      );
    }
    const filas = (await sql`
      INSERT INTO usuarios (correo, nombre, edad, ocupacion, correccion, consentimiento)
      VALUES (${correo}, ${nombre}, ${body.edad ?? ""}, ${body.ocupacion ?? ""}, ${body.correccion ?? ""}, TRUE)
      RETURNING id
    `) as { id: number }[];
    crearSesion(filas[0].id);
    return NextResponse.json({ ok: true, id: filas[0].id });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error de base de datos" },
      { status: 500 }
    );
  }
}
