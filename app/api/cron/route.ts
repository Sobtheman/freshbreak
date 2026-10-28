import { NextResponse } from "next/server";
import { ahoraBogota, bdDisponible, db } from "@/lib/db";
import { esCronAutorizado, tokenEnlace } from "@/lib/session";
import { pausasDelDia } from "@/lib/schedule";
import { randomEjercicio } from "@/lib/exercises";
import { enviarCorreo, htmlRecordatorio } from "@/lib/email";
import { invitarCierre } from "@/lib/cierre";
import {
  CIERRE_DESDE_MIN,
  CIERRE_HASTA_MIN,
  DIAS_INTERVENCION,
  DIAS_RECORDATORIO_CIERRE,
} from "@/lib/estudio";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Motor de recordatorios del lado del servidor. Un cron externo lo llama
// cada 5 minutos; él revisa qué estudiantes tienen una pausa programada en
// este momento (hora de Bogotá, dentro de sus bloques) y envía el correo.
// La tabla `envios` garantiza que cada pausa se notifica UNA sola vez.
// Ventana amplia: si el cron externo falla unos minutos, la pausa no se
// pierde; la unicidad en `envios` impide duplicados aunque dos ejecuciones
// cubran la misma pausa.
const VENTANA_MIN = 15;

async function ejecutar(req: Request) {
  if (!esCronAutorizado(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  if (!bdDisponible()) {
    return NextResponse.json({ ok: false, error: "Base de datos no configurada" }, { status: 503 });
  }

  const { dia, minutos, fecha } = ahoraBogota();
  const origen = process.env.APP_ORIGIN ?? "https://freshbreak.online";

  try {
    const sql = await db();
    const usuarios = (await sql`
      SELECT u.id, u.correo, u.nombre, u.intervalo_min,
             COALESCE(json_agg(json_build_object('dia', b.dia, 'inicio', b.inicio, 'fin', b.fin))
                      FILTER (WHERE b.id IS NOT NULL), '[]') AS bloques
      FROM usuarios u
      LEFT JOIN bloques b ON b.usuario_id = u.id
      WHERE u.recordatorios_activos AND u.consentimiento
      GROUP BY u.id
    `) as {
      id: number;
      correo: string;
      nombre: string;
      intervalo_min: number;
      bloques: { dia: number; inicio: number; fin: number }[];
    }[];

    let enviados = 0;
    let errores = 0;

    for (const u of usuarios) {
      const horas = pausasDelDia(u.bloques, dia, u.intervalo_min || 60);
      const debidas = horas.filter((h) => {
        const [hh, mm] = h.split(":").map(Number);
        const t = hh * 60 + mm;
        return t <= minutos && minutos < t + VENTANA_MIN;
      });
      for (const hora of debidas) {
        // Reclama el envío; si otra ejecución ya lo hizo, no devuelve fila.
        const claim = (await sql`
          INSERT INTO envios (usuario_id, fecha_dia, hora, ejercicio_id)
          VALUES (${u.id}, ${fecha}, ${hora}, NULL)
          ON CONFLICT (usuario_id, fecha_dia, hora) DO NOTHING
          RETURNING id
        `) as { id: number }[];
        if (!claim.length) continue;

        const ejercicio = randomEjercicio();
        const r = await enviarCorreo({
          para: u.correo,
          asunto: "¡Hora de tu pausa visual!",
          html: htmlRecordatorio({
            nombre: u.nombre.split(" ")[0],
            ejercicio,
            intervaloMin: u.intervalo_min || 60,
            origen,
            tokenEnlace: tokenEnlace(u.id),
          }),
        });
        if (r.ok) {
          enviados++;
          await sql`UPDATE envios SET ejercicio_id = ${ejercicio.id} WHERE id = ${claim[0].id}`;
        } else {
          errores++;
          // Libera el reclamo para que el próximo ciclo lo reintente
          await sql`DELETE FROM envios WHERE id = ${claim[0].id}`;
        }
      }
    }
    // Evaluación final: a los 42 días del registro, una invitación (en horario
    // diurno) y, si no se responde, un único recordatorio 3 días después. Se
    // respeta la baja: quien desactivó los correos no recibe la invitación.
    let cierres = 0;
    if (minutos >= CIERRE_DESDE_MIN && minutos < CIERRE_HASTA_MIN) {
      const porInvitar = (await sql`
        SELECT u.id, u.correo, u.nombre FROM usuarios u
        WHERE u.consentimiento AND u.recordatorios_activos
          AND u.cierre_enviado IS NULL
          AND u.creado <= now() - make_interval(days => ${DIAS_INTERVENCION})
          AND NOT EXISTS (SELECT 1 FROM sus s WHERE s.usuario_id = u.id)
      `) as { id: number; correo: string; nombre: string }[];
      for (const u of porInvitar) if (await invitarCierre(sql, u, false)) cierres++;

      const porRecordar = (await sql`
        SELECT u.id, u.correo, u.nombre FROM usuarios u
        WHERE u.consentimiento AND u.recordatorios_activos
          AND u.cierre_recordado IS NULL
          AND u.cierre_enviado <= now() - make_interval(days => ${DIAS_RECORDATORIO_CIERRE})
          AND NOT EXISTS (SELECT 1 FROM sus s WHERE s.usuario_id = u.id)
      `) as { id: number; correo: string; nombre: string }[];
      for (const u of porRecordar) if (await invitarCierre(sql, u, true)) cierres++;
    }

    return NextResponse.json({
      ok: true, fecha, dia, minutos, usuarios: usuarios.length, enviados, errores, cierres,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return ejecutar(req);
}
export async function POST(req: Request) {
  return ejecutar(req);
}
