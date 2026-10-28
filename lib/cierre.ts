import { db } from "./db";
import { tokenEnlace } from "./session";
import { enviarCorreo, htmlCierre } from "./email";

type Sql = Awaited<ReturnType<typeof db>>;
type Destinatario = { id: number; correo: string; nombre: string; anticipado?: boolean };

// Envía la invitación a la evaluación final (o su único recordatorio).
// Igual que los recordatorios de pausa, primero reclama el envío en la base
// de datos y solo entonces manda el correo: dos ejecuciones simultáneas del
// cron no pueden enviarlo dos veces. Si el correo falla, libera el reclamo
// para que la siguiente ejecución lo reintente.
export async function invitarCierre(
  sql: Sql,
  u: Destinatario,
  recordatorio: boolean
): Promise<boolean> {
  const claim = (recordatorio
    ? await sql`UPDATE usuarios SET cierre_recordado = now()
                WHERE id = ${u.id} AND cierre_recordado IS NULL RETURNING id`
    : await sql`UPDATE usuarios SET cierre_enviado = now()
                WHERE id = ${u.id} AND cierre_enviado IS NULL RETURNING id`) as { id: number }[];
  if (!claim.length) return false;

  const origen = process.env.APP_ORIGIN ?? "https://freshbreak.online";
  const r = await enviarCorreo({
    para: u.correo,
    asunto: recordatorio
      ? "Te falta la evaluación final de FreshBreak"
      : u.anticipado
        ? "Evaluación final de FreshBreak"
        : "Terminaste tus seis semanas: evaluación final de FreshBreak",
    html: htmlCierre({
      nombre: u.nombre.split(" ")[0],
      origen,
      tokenEnlace: tokenEnlace(u.id),
      recordatorio,
      anticipado: u.anticipado,
    }),
  });
  if (!r.ok) {
    if (recordatorio) await sql`UPDATE usuarios SET cierre_recordado = NULL WHERE id = ${u.id}`;
    else await sql`UPDATE usuarios SET cierre_enviado = NULL WHERE id = ${u.id}`;
    return false;
  }
  return true;
}
