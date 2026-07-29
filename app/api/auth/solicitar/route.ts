import { NextResponse } from "next/server";
import { bdDisponible, db } from "@/lib/db";
import { tokenLogin } from "@/lib/session";
import { enviarCorreo } from "@/lib/email";

// Enlace mágico: el estudiante escribe su correo y recibe un enlace para
// entrar sin contraseña. Siempre responde ok para no revelar qué correos
// existen.
export async function POST(req: Request) {
  if (!bdDisponible()) {
    return NextResponse.json({ ok: false, error: "Base de datos no configurada" }, { status: 503 });
  }
  let body: { correo?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }
  const correo = body.correo?.trim().toLowerCase();
  if (!correo) {
    return NextResponse.json({ ok: false, error: "Falta el correo" }, { status: 400 });
  }
  try {
    const sql = await db();
    const filas = (await sql`
      SELECT id, nombre FROM usuarios WHERE correo = ${correo}
    `) as { id: number; nombre: string }[];
    if (filas.length) {
      const origen = new URL(req.url).origin;
      const enlace = `${origen}/api/auth/entrar?token=${encodeURIComponent(tokenLogin(filas[0].id))}`;
      await enviarCorreo({
        para: correo,
        asunto: "Tu enlace para entrar a FreshBreak",
        html: `
        <div style="font-family:Arial,Helvetica,sans-serif;background:#F7FBFB;padding:24px;">
          <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;padding:28px;border:1px solid #E6F2F2;">
            <p style="margin:0;font-size:12px;letter-spacing:2px;color:#0E7C74;font-weight:bold;">FRESHBREAK</p>
            <h1 style="margin:12px 0 0;font-size:22px;color:#0E3B3B;">Hola, ${filas[0].nombre.split(" ")[0]}</h1>
            <p style="margin:10px 0 18px;font-size:14px;color:#3D5C5C;">
              Toca el botón para entrar a tu panel. El enlace vale por 15 minutos.
            </p>
            <div style="text-align:center;">
              <a href="${enlace}" style="display:inline-block;background:#0E3B3B;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:10px;">Entrar a FreshBreak</a>
            </div>
            <p style="margin:20px 0 0;font-size:11px;color:#8AA5A3;text-align:center;">
              Si no pediste este enlace, ignora este correo.
            </p>
          </div>
        </div>`,
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}
