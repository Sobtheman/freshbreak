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

// Correo de bienvenida al activar (o actualizar) el plan: confirma que el
// canal funciona y anuncia la próxima pausa, para que nadie se quede con la
// sensación de "me registré y no pasó nada".
export function htmlBienvenida(opts: {
  nombre: string;
  intervaloMin: number;
  proximaTexto: string;
  origen: string;
  tokenEnlace?: string;
}) {
  const { nombre, intervaloMin, proximaTexto, origen, tokenEnlace } = opts;
  const baja = tokenEnlace ? `${origen}/api/baja?u=${encodeURIComponent(tokenEnlace)}` : null;
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#F7FBFB;padding:24px;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;padding:28px;border:1px solid #E6F2F2;">
      <p style="margin:0;font-size:12px;letter-spacing:2px;color:#0E7C74;font-weight:bold;">FRESHBREAK · TU PLAN ESTÁ ACTIVO</p>
      <h1 style="margin:12px 0 0;font-size:22px;color:#0E3B3B;">Hola, ${nombre}</h1>
      <p style="margin:10px 0 0;font-size:14px;color:#3D5C5C;">
        Tus recordatorios de pausa visual quedaron programados dentro de tus
        bloques de estudio, cada ${intervaloMin} minutos.
      </p>
      <div style="background:#F2F9F8;border-radius:12px;padding:18px;margin:18px 0;text-align:center;">
        <p style="margin:0;font-size:12px;letter-spacing:1px;color:#0E7C74;font-weight:bold;">PRÓXIMA PAUSA</p>
        <p style="margin:6px 0 0;font-size:20px;font-weight:bold;color:#0E3B3B;">${proximaTexto}</p>
      </div>
      <p style="margin:0;font-size:13px;color:#3D5C5C;">
        Cada recordatorio llegará a este correo con el ejercicio del momento.
        Si este mensaje cayó en spam, márcalo como «no es spam» para que los
        siguientes lleguen a tu bandeja de entrada.
      </p>
      <div style="text-align:center;margin-top:18px;">
        <a href="${origen}/panel" style="display:inline-block;background:#0E3B3B;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:10px;">Ver mi panel</a>
      </div>
      <p style="margin:20px 0 0;font-size:11px;color:#8AA5A3;text-align:center;">
        Datos protegidos según la Ley 1581 de 2012.${
          baja ? `<br/><a href="${baja}" style="color:#8AA5A3;">Dejar de recibir recordatorios</a>` : ""
        }
      </p>
    </div>
  </div>`;
}

// Invitación a la evaluación final (CVS-Q de cierre + escala SUS) al cumplir
// las seis semanas, o cuando el equipo cierra el estudio antes (`anticipado`:
// entonces no se puede decir "terminaste las seis semanas"). `recordatorio`
// es el único aviso de seguimiento.
export function htmlCierre(opts: {
  nombre: string;
  origen: string;
  tokenEnlace: string;
  recordatorio?: boolean;
  anticipado?: boolean;
}) {
  const { nombre, origen, tokenEnlace, recordatorio, anticipado } = opts;
  const enlace = `${origen}/cierre?u=${encodeURIComponent(tokenEnlace)}`;
  const baja = `${origen}/api/baja?u=${encodeURIComponent(tokenEnlace)}`;
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#F7FBFB;padding:24px;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;padding:28px;border:1px solid #E6F2F2;">
      <p style="margin:0;font-size:12px;letter-spacing:2px;color:#0E7C74;font-weight:bold;">FRESHBREAK · ${
        recordatorio ? "TE FALTA LA EVALUACIÓN FINAL" : "EVALUACIÓN FINAL"
      }</p>
      <h1 style="margin:12px 0 0;font-size:22px;color:#0E3B3B;">Hola, ${nombre}</h1>
      <p style="margin:10px 0 0;font-size:14px;color:#3D5C5C;">
        ${
          recordatorio
            ? "Hace unos días te invitamos a la evaluación final de FreshBreak y aún no la has respondido. Tus respuestas son las que permiten saber si las pausas sirvieron."
            : anticipado
              ? "El equipo de FreshBreak está cerrando el estudio. Necesitamos tu opinión para saber si las pausas visuales te sirvieron durante el tiempo que usaste la aplicación."
              : "Terminaste las seis semanas de uso de FreshBreak. Ahora necesitamos tu opinión para saber si las pausas visuales te sirvieron."
        }
      </p>
      <div style="background:#F2F9F8;border-radius:12px;padding:18px;margin:18px 0;">
        <p style="margin:0;font-size:14px;color:#0E3B3B;"><b>Son dos partes, unos 4 minutos:</b></p>
        <ol style="margin:10px 0 0;padding-left:20px;font-size:13px;color:#3D5C5C;">
          <li style="margin:0 0 6px;">El cuestionario de síntomas, el mismo del inicio, para comparar.</li>
          <li style="margin:0;">Diez preguntas cortas sobre qué tan fácil y útil te resultó la aplicación.</li>
        </ol>
      </div>
      <div style="text-align:center;">
        <a href="${enlace}" style="display:inline-block;background:#0E3B3B;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:10px;">Responder la evaluación final</a>
      </div>
      <p style="margin:20px 0 0;font-size:11px;color:#8AA5A3;text-align:center;">
        Datos protegidos según la Ley 1581 de 2012.<br/>
        <a href="${baja}" style="color:#8AA5A3;">Dejar de recibir correos de FreshBreak</a>
      </p>
    </div>
  </div>`;
}

export async function enviarCorreo(opts: {
  para: string;
  asunto: string;
  html: string;
  responderA?: string; // para poder contestar directo al remitente
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
      ...(opts.responderA ? { reply_to: opts.responderA } : {}),
    }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    return { ok: false, error: data?.message ?? `Resend respondió ${r.status}` };
  }
  return { ok: true, id: data.id };
}
