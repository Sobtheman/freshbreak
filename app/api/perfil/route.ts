import { NextResponse } from "next/server";
import { bdDisponible, db } from "@/lib/db";
import { usuarioDeSesion } from "@/lib/session";

// Actualiza el perfil del estudiante con sesión. El correo también puede
// cambiarse, salvo que ya pertenezca a otra cuenta.
export async function POST(req: Request) {
  if (!bdDisponible()) {
    return NextResponse.json({ ok: false, error: "Base de datos no configurada" }, { status: 503 });
  }
  const usuarioId = usuarioDeSesion();
  if (!usuarioId) {
    return NextResponse.json({ ok: false, error: "Sin sesión" }, { status: 401 });
  }
  let body: {
    nombre?: string;
    correo?: string;
    edad?: string;
    ocupacion?: string;
    correccion?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }
  const nombre = body.nombre?.trim();
  const correo = body.correo?.trim().toLowerCase();
  if (!nombre || !correo) {
    return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 });
  }
  try {
    const sql = await db();
    const otros = (await sql`
      SELECT id FROM usuarios WHERE correo = ${correo} AND id != ${usuarioId}
    `) as { id: number }[];
    if (otros.length) {
      return NextResponse.json(
        { ok: false, code: "correo_en_uso", error: "Ese correo pertenece a otra cuenta" },
        { status: 409 }
      );
    }
    await sql`
      UPDATE usuarios SET
        nombre = ${nombre},
        correo = ${correo},
        edad = ${body.edad ?? ""},
        ocupacion = ${body.ocupacion ?? ""},
        correccion = ${body.correccion ?? ""}
      WHERE id = ${usuarioId}
    `;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error de base de datos" },
      { status: 500 }
    );
  }
}
