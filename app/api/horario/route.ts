import { NextResponse } from "next/server";
import { ahoraBogota, bdDisponible, db } from "@/lib/db";
import { tokenEnlace, usuarioDeSesion } from "@/lib/session";
import { DIAS, pausasDelDia, type Bloque } from "@/lib/schedule";
import { enviarCorreo, htmlBienvenida } from "@/lib/email";

// Próxima pausa a partir de ahora (hora de Bogotá). Recorre 8 días para
// cubrir el caso de un único bloque semanal cuyas pausas de hoy ya pasaron
// (la siguiente es el mismo día de la próxima semana).
function proximaPausa(bloques: Bloque[], intervaloMin: number) {
  const { dia, minutos } = ahoraBogota();
  for (let i = 0; i <= 7; i++) {
    const d = (dia + i) % 7;
    for (const h of pausasDelDia(bloques, d, intervaloMin)) {
      const [hh, mm] = h.split(":").map(Number);
      if (i > 0 || hh * 60 + mm > minutos) {
        return i === 0 ? `Hoy a las ${h}` : `${DIAS[d]} a las ${h}`;
      }
    }
  }
  return null;
}

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

    // Al activar el plan (cuando llegan bloques) se envía el correo de
    // bienvenida con la próxima pausa: confirma el canal de correo desde el
    // primer minuto. Si el envío falla, el plan igual queda guardado.
    if (bloques !== undefined && bloques.length > 0) {
      try {
        const u = (await sql`
          SELECT correo, nombre, intervalo_min FROM usuarios WHERE id = ${usuarioId}
        `) as { correo: string; nombre: string; intervalo_min: number }[];
        if (u.length) {
          const proxima = proximaPausa(bloques, u[0].intervalo_min || 60);
          await enviarCorreo({
            para: u[0].correo,
            asunto: "Tu plan de pausas está activo",
            html: htmlBienvenida({
              nombre: u[0].nombre.split(" ")[0],
              intervaloMin: u[0].intervalo_min || 60,
              proximaTexto: proxima ?? "Se programará en tu próximo bloque de estudio",
              origen: new URL(req.url).origin,
              tokenEnlace: tokenEnlace(usuarioId),
            }),
          });
        }
      } catch {
        // el correo de bienvenida nunca bloquea el guardado del plan
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error de base de datos" },
      { status: 500 }
    );
  }
}
