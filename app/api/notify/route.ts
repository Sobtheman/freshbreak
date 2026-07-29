import { NextResponse } from "next/server";
import { getEjercicio } from "@/lib/exercises";
import { enviarCorreo, htmlRecordatorio } from "@/lib/email";
import { tokenEnlace, usuarioDeSesion } from "@/lib/session";

// Disparo inmediato desde la app (botón de simulación y pausas con la
// pestaña abierta). Los envíos programados con la pestaña cerrada los hace
// /api/cron. Comparten plantilla y remitente (dominio verificado
// freshbreak.online).
export async function POST(req: Request) {
  let body: { correo?: string; nombre?: string; ejercicioId?: string; intervaloMin?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }

  const ejercicio = getEjercicio(body.ejercicioId ?? "");
  if (!ejercicio || !body.correo) {
    return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 });
  }

  const usuarioId = usuarioDeSesion();
  const r = await enviarCorreo({
    para: body.correo,
    asunto: "¡Hora de tu pausa visual!",
    html: htmlRecordatorio({
      nombre: (body.nombre ?? "Estudiante").split(" ")[0],
      ejercicio,
      intervaloMin: body.intervaloMin ?? 60,
      origen: new URL(req.url).origin,
      tokenEnlace: usuarioId ? tokenEnlace(usuarioId) : undefined,
    }),
  });
  if (!r.ok) {
    return NextResponse.json({ ok: false, error: r.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true, id: r.id });
}
