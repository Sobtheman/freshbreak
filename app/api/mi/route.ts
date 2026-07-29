import { NextResponse } from "next/server";
import { ahoraBogota, bdDisponible, db } from "@/lib/db";
import { usuarioDeSesion } from "@/lib/session";
import { pausasDelDia } from "@/lib/schedule";

export const dynamic = "force-dynamic";

// Devuelve todo el estado del estudiante con sesión: perfil, horario,
// historial CVS-Q, cumplimientos y el resumen real de la última semana.
export async function GET() {
  if (!bdDisponible()) {
    return NextResponse.json({ ok: false, error: "Base de datos no configurada" }, { status: 503 });
  }
  const usuarioId = usuarioDeSesion();
  if (!usuarioId) {
    return NextResponse.json({ ok: false, error: "Sin sesión" }, { status: 401 });
  }
  try {
    const sql = await db();
    const usuarios = (await sql`
      SELECT id, correo, nombre, edad, ocupacion, correccion, horas_pantalla,
             intervalo_min, recordatorios_activos
      FROM usuarios WHERE id = ${usuarioId}
    `) as Record<string, unknown>[];
    if (!usuarios.length) {
      return NextResponse.json({ ok: false, error: "Usuario no existe" }, { status: 404 });
    }
    const u = usuarios[0];

    const bloques = (await sql`
      SELECT dia, inicio, fin FROM bloques WHERE usuario_id = ${usuarioId} ORDER BY dia, inicio
    `) as { dia: number; inicio: number; fin: number }[];

    const historialCvsq = (await sql`
      SELECT puntaje, fecha FROM cvsq WHERE usuario_id = ${usuarioId} ORDER BY fecha ASC
    `) as { puntaje: number; fecha: string }[];

    const conteos = (await sql`
      SELECT ejercicio_id, COUNT(*)::int AS n
      FROM cumplimientos WHERE usuario_id = ${usuarioId}
      GROUP BY ejercicio_id
    `) as { ejercicio_id: string; n: number }[];

    // Cumplimientos por día local (Bogotá = UTC-5) de los últimos 7 días
    const porDia = (await sql`
      SELECT to_char(fecha AT TIME ZONE 'America/Bogota', 'YYYY-MM-DD') AS dia_local,
             COUNT(*)::int AS n
      FROM cumplimientos
      WHERE usuario_id = ${usuarioId}
        AND fecha > now() - interval '8 days'
      GROUP BY dia_local
    `) as { dia_local: string; n: number }[];

    const { dia, fecha } = ahoraBogota();
    const intervalo = Number(u.intervalo_min) || 60;

    // Semana real: para cada uno de los últimos 7 días, pausas programadas
    // según el horario vs. cumplidas según el registro.
    const semana: { fecha: string; dia: number; programadas: number; cumplidas: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.parse(fecha + "T00:00:00Z") - i * 86400000);
      const f = d.toISOString().slice(0, 10);
      const diaSemana = (((dia - i) % 7) + 7) % 7;
      const programadas = pausasDelDia(bloques, diaSemana, intervalo).length;
      const cumplidas = porDia.find((p) => p.dia_local === f)?.n ?? 0;
      semana.push({ fecha: f, dia: diaSemana, programadas, cumplidas });
    }
    const cumplidasHoy = semana[semana.length - 1]?.cumplidas ?? 0;

    return NextResponse.json({
      ok: true,
      usuario: {
        correo: u.correo,
        nombre: u.nombre,
        edad: u.edad,
        ocupacion: u.ocupacion,
        correccion: u.correccion,
      },
      horasPantalla: Number(u.horas_pantalla) || 6,
      intervaloMin: intervalo,
      recordatoriosActivos: Boolean(u.recordatorios_activos),
      bloques,
      historialCvsq: historialCvsq.map((h) => ({
        puntaje: h.puntaje,
        fecha: String(h.fecha).slice(0, 10),
      })),
      completions: Object.fromEntries(conteos.map((c) => [c.ejercicio_id, c.n])),
      cumplidasHoy,
      semana,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error de base de datos" },
      { status: 500 }
    );
  }
}
