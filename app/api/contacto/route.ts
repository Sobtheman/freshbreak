import { NextResponse } from "next/server";
import { bdDisponible, db } from "@/lib/db";
import { enviarCorreo } from "@/lib/email";

// Formulario de contacto de la página de inicio: guarda el mensaje y avisa
// por correo al equipo, con respuesta directa al remitente.
export async function POST(req: Request) {
  let body: { nombre?: string; correo?: string; mensaje?: string; web?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }

  // Campo trampa: los formularios automáticos lo rellenan, las personas no.
  if (body.web) return NextResponse.json({ ok: true });

  const nombre = (body.nombre ?? "").trim().slice(0, 120);
  const correo = (body.correo ?? "").trim().toLowerCase().slice(0, 160);
  const mensaje = (body.mensaje ?? "").trim().slice(0, 4000);
  if (!nombre || !correo || !mensaje || !correo.includes("@")) {
    return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 });
  }

  if (bdDisponible()) {
    try {
      const sql = await db();
      await sql`
        INSERT INTO mensajes (nombre, correo, mensaje)
        VALUES (${nombre}, ${correo}, ${mensaje})
      `;
    } catch {
      // Si la base de datos falla, el aviso por correo sigue adelante.
    }
  }

  const destino = process.env.CONTACTO_EMAIL ?? "jsebasdr@gmail.com";
  const escapar = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const r = await enviarCorreo({
    para: destino,
    asunto: `Mensaje de ${nombre} desde FreshBreak`,
    responderA: correo,
    html: `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#F7FBFB;padding:24px;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;padding:28px;border:1px solid #E6F2F2;">
        <p style="margin:0;font-size:12px;letter-spacing:2px;color:#0E7C74;font-weight:bold;">FRESHBREAK · NUEVO MENSAJE</p>
        <h1 style="margin:12px 0 0;font-size:20px;color:#0E3B3B;">${escapar(nombre)}</h1>
        <p style="margin:4px 0 16px;font-size:13px;color:#3D5C5C;">${escapar(correo)}</p>
        <div style="background:#F2F9F8;border-radius:12px;padding:18px;font-size:14px;color:#0E3B3B;white-space:pre-wrap;">${escapar(mensaje)}</div>
        <p style="margin:18px 0 0;font-size:11px;color:#8AA5A3;">
          Responde a este correo para contestarle directamente.
        </p>
      </div>
    </div>`,
  });

  if (!r.ok) {
    // El mensaje quedó guardado aunque el aviso no salga: no se pierde.
    return NextResponse.json({ ok: true, aviso: "guardado_sin_correo" });
  }
  return NextResponse.json({ ok: true });
}
