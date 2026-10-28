import { NextResponse } from "next/server";
import { bdDisponible, db } from "@/lib/db";
import { esCronAutorizado } from "@/lib/session";
import { invitarCierre } from "@/lib/cierre";
import { DIAS_INTERVENCION } from "@/lib/estudio";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Cierre manual del estudio (protegido con la clave del equipo): envía ya la
// invitación a la evaluación final a quien todavía no la ha recibido, sin
// esperar a que cada estudiante cumpla sus 42 días. Sirve cuando la fecha de
// entrega del trabajo de grado obliga a cerrar antes. Quien se dio de baja de
// los correos no la recibe.
export async function POST(req: Request) {
  if (!esCronAutorizado(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  if (!bdDisponible()) {
    return NextResponse.json({ ok: false, error: "Base de datos no configurada" }, { status: 503 });
  }
  try {
    const sql = await db();
    const pendientes = (await sql`
      SELECT u.id, u.correo, u.nombre,
             u.creado > now() - make_interval(days => ${DIAS_INTERVENCION}) AS anticipado
      FROM usuarios u
      WHERE u.consentimiento AND u.recordatorios_activos
        AND u.cierre_enviado IS NULL
        AND NOT EXISTS (SELECT 1 FROM sus s WHERE s.usuario_id = u.id)
    `) as { id: number; correo: string; nombre: string; anticipado: boolean }[];
    let enviados = 0;
    for (const u of pendientes) if (await invitarCierre(sql, u, false)) enviados++;
    return NextResponse.json({ ok: true, pendientes: pendientes.length, enviados });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error de base de datos" },
      { status: 500 }
    );
  }
}
