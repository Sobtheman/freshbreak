import { NextResponse } from "next/server";
import { bdDisponible, db } from "@/lib/db";
import { usuarioDeEnlace, usuarioDeSesion } from "@/lib/session";
import { getEjercicio } from "@/lib/exercises";

// Registra un cumplimiento real. Acepta sesión (uso normal en la app) o el
// token del enlace del correo (cuando el estudiante llega sin sesión).
export async function POST(req: Request) {
  if (!bdDisponible()) {
    return NextResponse.json({ ok: false, error: "Base de datos no configurada" }, { status: 503 });
  }
  let body: { ejercicioId?: string; u?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }
  const ejercicio = getEjercicio(body.ejercicioId ?? "");
  if (!ejercicio) {
    return NextResponse.json({ ok: false, error: "Ejercicio desconocido" }, { status: 400 });
  }
  const deSesion = usuarioDeSesion();
  const deEnlace = usuarioDeEnlace(body.u ?? null);
  const usuarioId = deSesion ?? deEnlace;
  if (!usuarioId) {
    return NextResponse.json({ ok: false, error: "Sin sesión" }, { status: 401 });
  }
  try {
    const sql = await db();
    await sql`
      INSERT INTO cumplimientos (usuario_id, ejercicio_id, fuente)
      VALUES (${usuarioId}, ${ejercicio.id}, ${deSesion ? "app" : "correo"})
    `;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error de base de datos" },
      { status: 500 }
    );
  }
}
