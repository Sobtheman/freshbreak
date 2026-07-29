import { Ejercicio } from "./exercises";

// Plantilla compartida del correo de recordatorio (la usan /api/notify —
// disparo desde la app — y /api/cron — envío programado por horario).
export function htmlRecordatorio(opts: {
  nombre: string;
  ejercicio: Ejercicio;
  intervaloMin: number;
  origen: string;
  tokenEnlace?: string; // identifica al usuario en los enlaces del correo
}) {
  const { nombre, ejercicio, intervaloMin, origen, tokenEnlace } = opts;
  const sufijo = tokenEnlace ? `?u=${encodeURIComponent(tokenEnlace)}` : "";
  const enlace = `${origen}/ejercicio/${ejercicio.id}${sufijo}`;
  const baja = tokenEnlace ? `${origen}/api/baja?u=${encodeURIComponent(tokenEnlace)}` : null;
  const pasos = ejercicio.pasos
    .slice(0, 3)
    .map((p) => `<li style="margin:0 0 6px;">${p}</li>`)
    .join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#F7FBFB;padding:24px;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;padding:28px;border:1px solid #E6F2F2;">
      <p style="margin:0;font-size:12px;letter-spacing:2px;color:#0E7C74;font-weight:bold;">FRESHBREAK · HORA DE TU PAUSA VISUAL</p>
      <h1 style="margin:12px 0 0;font-size:22px;color:#0E3B3B;">Hola, ${nombre}</h1>
      <p style="margin:10px 0 0;font-size:14px;color:#3D5C5C;">
        Tu vista necesita un descanso. Este recordatorio está programado dentro de tu bloque de estudio
        (cada ${intervaloMin} minutos). Te recomendamos:
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
        Datos protegidos según la Ley 1581 de 2012 — este correo solo incluye tu nombre y las indicaciones del ejercicio.${
          baja
            ? `<br/><a href="${baja}" style="color:#8AA5A3;">Dejar de recibir recordatorios</a>`
            : ""
        }
      </p>
    </div>
  </div>`;
}

export async function enviarCorreo(opts: {
  para: string;
  asunto: string;
  html: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const key = process.env.RESEND_API_KEY ?? "";
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "FreshBreak <recordatorios@freshbreak.online>",
      to: [opts.para],
      subject: opts.asunto,
      html: opts.html,
    }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    return { ok: false, error: data?.message ?? `Resend respondió ${r.status}` };
  }
  return { ok: true, id: data.id };
}
