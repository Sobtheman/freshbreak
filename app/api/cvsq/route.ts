import { NextResponse } from "next/server";
import { bdDisponible, db } from "@/lib/db";
import { usuarioDeSesion } from "@/lib/session";

// Guarda un resultado del cuestionario CVS-Q (se puede repetir en el
// tiempo: cada fila es una medición del historial de síntomas).
export async function POST(req: Request) {
  if (!bdDisponible()) {
    return NextResponse.json({ ok: false, error: "Base de datos no configurada" }, { status: 503 });
  }
  const usuarioId = usuarioDeSesion();
  if (!usuarioId) {
    return NextResponse.json({ ok: false, error: "Sin sesión" }, { status: 401 });
  }
  let body: { puntaje?: number; respuestas?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }
  if (typeof body.puntaje !== "number") {
    return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 });
  }
  try {
    const sql = await db();
    // La primera medición es la basal; las siguientes, seguimiento semanal.
    // La final la registra /api/cierre.
    await sql`
      INSERT INTO cvsq (usuario_id, puntaje, respuestas, momento)
      VALUES (
        ${usuarioId}, ${body.puntaje}, ${JSON.stringify(body.respuestas ?? null)},
        CASE WHEN EXISTS (SELECT 1 FROM cvsq WHERE usuario_id = ${usuarioId})
             THEN 'seguimiento' ELSE 'inicial' END
      )
    `;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error de base de datos" },
      { status: 500 }
    );
  }
}
