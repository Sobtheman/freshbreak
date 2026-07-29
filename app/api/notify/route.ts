import { NextResponse } from "next/server";
import { getEjercicio } from "@/lib/exercises";

// Envía el recordatorio real por correo usando la API REST de Resend.
// La clave vive en .env.local (RESEND_API_KEY) y nunca se versiona.
// Dominio verificado en Resend: freshbreak.online — puede entregar a
// cualquier destinatario desde recordatorios@freshbreak.online.
export async function POST(req: Request) {
  // Variable de entorno primero (despliegues); clave del proyecto como
  // respaldo para que un clon fresco funcione sin configuración.
  const key = process.env.RESEND_API_KEY ?? "";
  if (!key) {
    return NextResponse.json(
      { ok: false, error: "RESEND_API_KEY no está configurada" },
      { status: 500 }
    );
  }

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

  const nombre = (body.nombre ?? "Estudiante").split(" ")[0];
  const origen = new URL(req.url).origin;
  const enlace = `${origen}/ejercicio/${ejercicio.id}`;
  const pasos = ejercicio.pasos
    .slice(0, 3)
    .map((p) => `<li style="margin:0 0 6px;">${p}</li>`)
    .join("");

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#F7FBFB;padding:24px;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;padding:28px;border:1px solid #E6F2F2;">
      <p style="margin:0;font-size:12px;letter-spacing:2px;color:#0E7C74;font-weight:bold;">FRESHBREAK · HORA DE TU PAUSA VISUAL</p>
      <h1 style="margin:12px 0 0;font-size:22px;color:#0E3B3B;">Hola, ${nombre}</h1>
      <p style="margin:10px 0 0;font-size:14px;color:#3D5C5C;">
        Tu vista necesita un descanso. Este recordatorio está programado dentro de tu bloque de estudio
        (cada ${body.intervaloMin ?? 60} minutos). Te recomendamos:
      </p>
      <div style="background:#F2F9F8;border-radius:12px;padding:18px;margin:18px 0;">
        <p style="margin:0;font-size:16px;font-weight:bold;color:#0E3B3B;">${ejercicio.nombre}</p>
        <ol style="margin:10px 0 0;padding-left:20px;font-size:13px;color:#3D5C5C;">${pasos}</ol>
        <p style="margin:12px 0 0;font-size:11px;letter-spacing:1px;color:#0E7C74;font-weight:bold;">DURACIÓN: ${ejercicio.duracionLabel.toUpperCase()}</p>
      </div>
      <div style="text-align:center;">
        <a href="${enlace}" style="display:inline-block;background:#0E3B3B;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:10px;">Realizar ejercicio ahora</a>
      </div>
      <p style="margin:20px 0 0;font-size:11px;color:#8AA5A3;text-align:center;">
        Recibes este correo porque activaste los recordatorios de FreshBreak según tu horario académico.<br/>
        Datos protegidos según la Ley 1581 de 2012 — este correo solo incluye tu nombre y las indicaciones del ejercicio.
      </p>
    </div>
  </div>`;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "FreshBreak <recordatorios@freshbreak.online>",
      to: [body.correo],
      subject: "¡Hora de tu pausa visual!",
      html,
    }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    return NextResponse.json(
      { ok: false, error: data?.message ?? `Resend respondió ${r.status}` },
      { status: 502 }
    );
  }
  return NextResponse.json({ ok: true, id: data.id });
}
