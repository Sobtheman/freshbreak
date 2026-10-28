import { NextResponse } from "next/server";
import { bdDisponible, db } from "@/lib/db";
import { esCronAutorizado } from "@/lib/session";

export const dynamic = "force-dynamic";

// Resumen de todos los estudiantes para la vista de administración
// (protegida con la misma clave del cron: es solo para el equipo).
export async function GET(req: Request) {
  if (!esCronAutorizado(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  if (!bdDisponible()) {
    return NextResponse.json({ ok: false, error: "Base de datos no configurada" }, { status: 503 });
  }
  try {
    const sql = await db();
    const filas = (await sql`
      SELECT
        u.id,
        u.nombre,
        u.correo,
        u.creado,
        u.intervalo_min,
        u.horas_pantalla,
        u.recordatorios_activos,
        (SELECT COALESCE(json_agg(json_build_object('dia', b.dia, 'inicio', b.inicio, 'fin', b.fin) ORDER BY b.dia, b.inicio), '[]')
          FROM bloques b WHERE b.usuario_id = u.id) AS bloques,
        (SELECT COUNT(*)::int FROM cumplimientos c WHERE c.usuario_id = u.id) AS cumplimientos,
        (SELECT COUNT(*)::int FROM cumplimientos c
          WHERE c.usuario_id = u.id AND c.fecha > now() - interval '7 days') AS cumplimientos_7d,
        (SELECT COUNT(*)::int FROM envios e WHERE e.usuario_id = u.id) AS correos_enviados,
        (SELECT q.puntaje FROM cvsq q WHERE q.usuario_id = u.id ORDER BY q.fecha ASC LIMIT 1) AS cvsq_inicial,
        (SELECT q.puntaje FROM cvsq q WHERE q.usuario_id = u.id ORDER BY q.fecha DESC LIMIT 1) AS cvsq_actual,
        (SELECT COUNT(*)::int FROM cvsq q WHERE q.usuario_id = u.id) AS mediciones,
        (SELECT q.puntaje FROM cvsq q WHERE q.usuario_id = u.id AND q.momento = 'final'
          ORDER BY q.fecha DESC LIMIT 1) AS cvsq_final,
        (SELECT s.puntaje::float FROM sus s WHERE s.usuario_id = u.id) AS sus,
        u.cierre_enviado,
        u.consentimiento,
        FLOOR(EXTRACT(EPOCH FROM (now() - u.creado)) / 86400)::int AS dias
      FROM usuarios u
      ORDER BY u.creado DESC
    `) as Record<string, unknown>[];

    // `creado` va con su zona horaria: la página ya lo muestra en hora de
    // Bogotá. Convertirlo también aquí lo restaba dos veces (10:00 → 5:00).
    const mensajes = (await sql`
      SELECT id, nombre, correo, mensaje, creado
      FROM mensajes ORDER BY creado DESC LIMIT 50
    `) as Record<string, unknown>[];

    const totales = {
      estudiantes: filas.length,
      activos: filas.filter((f) => f.recordatorios_activos).length,
      cumplimientos: filas.reduce((a, f) => a + Number(f.cumplimientos), 0),
      correos: filas.reduce((a, f) => a + Number(f.correos_enviados), 0),
    };

    // Resultados del estudio (objetivos 3 y 4): solo quienes completaron la
    // evaluación final y tienen medición inicial cuentan para el pre/post.
    const media = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
    const completos = filas.filter((f) => f.sus !== null);
    const pares = completos.filter((f) => f.cvsq_inicial !== null && f.cvsq_final !== null);
    const estudio = {
      invitados: filas.filter((f) => f.cierre_enviado !== null).length,
      completados: completos.length,
      susMedia: media(completos.map((f) => Number(f.sus))),
      cvsqInicialMedia: media(pares.map((f) => Number(f.cvsq_inicial))),
      cvsqFinalMedia: media(pares.map((f) => Number(f.cvsq_final))),
      pares: pares.length,
      pendientesDeInvitar: filas.filter(
        (f) => f.consentimiento && f.recordatorios_activos && f.cierre_enviado === null && f.sus === null
      ).length,
    };
    return NextResponse.json({ ok: true, totales, estudio, estudiantes: filas, mensajes });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error de base de datos" },
      { status: 500 }
    );
  }
}
