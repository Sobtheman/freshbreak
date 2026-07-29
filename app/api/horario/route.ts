import { NextResponse } from "next/server";
import { bdDisponible, db } from "@/lib/db";
import { usuarioDeSesion } from "@/lib/session";

// Guarda los bloques de estudio, las horas de pantalla y el intervalo
// recomendado. Reemplaza el horario anterior por completo.
export async function POST(req: Request) {
  if (!bdDisponible()) {
    return NextResponse.json({ ok: false, error: "Base de datos no configurada" }, { status: 503 });
  }
  const usuarioId = usuarioDeSesion();
  if (!usuarioId) {
    return NextResponse.json({ ok: false, error: "Sin sesión" }, { status: 401 });
  }
  let body: {
    bloques?: { dia: number; inicio: number; fin: number }[];
    horasPantalla?: number;
    intervaloMin?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }
  // Actualización parcial: los campos ausentes conservan su valor actual
  // (el panel puede cambiar solo el intervalo sin reenviar los bloques).
  const bloques = body.bloques?.filter(
    (b) =>
      Number.isInteger(b.dia) && b.dia >= 0 && b.dia <= 6 &&
      Number.isInteger(b.inicio) && Number.isInteger(b.fin) &&
      b.inicio >= 0 && b.fin > b.inicio && b.fin <= 24
  );
  const horas =
    body.horasPantalla === undefined
      ? null
      : Math.max(1, Math.min(16, body.horasPantalla));
  const intervalo =
    body.intervaloMin === undefined ? null : body.intervaloMin === 45 ? 45 : 60;
  try {
    const sql = await db();
    if (bloques !== undefined) {
      await sql`DELETE FROM bloques WHERE usuario_id = ${usuarioId}`;
      for (const b of bloques) {
        await sql`INSERT INTO bloques (usuario_id, dia, inicio, fin) VALUES (${usuarioId}, ${b.dia}, ${b.inicio}, ${b.fin})`;
      }
    }
    await sql`
      UPDATE usuarios SET
        horas_pantalla = COALESCE(${horas}, horas_pantalla),
        intervalo_min = COALESCE(${intervalo}, intervalo_min),
        recordatorios_activos = TRUE
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
