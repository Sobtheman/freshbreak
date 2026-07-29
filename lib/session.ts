import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// Secreto de la aplicación: firma cookies de sesión, tokens de los enlaces
// del correo y autoriza el cron. En producción se define APP_SECRET en
// Vercel; el respaldo permite que un despliegue fresco no se rompa.
export function appSecret() {
  return process.env.APP_SECRET ?? "freshbreak-demo-secreto";
}

function hmac(datos: string) {
  return createHmac("sha256", appSecret()).update(datos).digest("hex").slice(0, 32);
}

function igualSeguro(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

const COOKIE = "fb_sesion";

// ---- Sesión (cookie firmada) ----
export function crearSesion(usuarioId: number) {
  const valor = `${usuarioId}.${hmac(`sesion:${usuarioId}`)}`;
  cookies().set(COOKIE, valor, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}

export function usuarioDeSesion(): number | null {
  const v = cookies().get(COOKIE)?.value;
  if (!v) return null;
  const [id, firma] = v.split(".");
  if (!id || !firma) return null;
  if (!igualSeguro(firma, hmac(`sesion:${id}`))) return null;
  return Number(id);
}

export function cerrarSesion() {
  cookies().set(COOKIE, "", { path: "/", maxAge: 0 });
}

// ---- Token de enlace (correo): identifica al usuario sin sesión ----
export function tokenEnlace(usuarioId: number) {
  return `${usuarioId}.${hmac(`enlace:${usuarioId}`)}`;
}

export function usuarioDeEnlace(token: string | null): number | null {
  if (!token) return null;
  const [id, firma] = token.split(".");
  if (!id || !firma) return null;
  if (!igualSeguro(firma, hmac(`enlace:${id}`))) return null;
  return Number(id);
}

// ---- Token de inicio de sesión (enlace mágico, expira en 15 min) ----
export function tokenLogin(usuarioId: number) {
  const exp = Date.now() + 15 * 60 * 1000;
  return `${usuarioId}.${exp}.${hmac(`login:${usuarioId}:${exp}`)}`;
}

export function usuarioDeLogin(token: string | null): number | null {
  if (!token) return null;
  const [id, exp, firma] = token.split(".");
  if (!id || !exp || !firma) return null;
  if (Number(exp) < Date.now()) return null;
  if (!igualSeguro(firma, hmac(`login:${id}:${exp}`))) return null;
  return Number(id);
}

// ---- Autorización del cron ----
export function esCronAutorizado(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const clave = new URL(req.url).searchParams.get("clave") ?? "";
  const esperado = appSecret();
  return auth === `Bearer ${esperado}` || (clave !== "" && igualSeguro(clave, esperado));
}
