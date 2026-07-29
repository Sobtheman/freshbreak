import { NextResponse } from "next/server";
import { bdDisponible, db } from "@/lib/db";
import { usuarioDeEnlace } from "@/lib/session";

export const dynamic = "force-dynamic";

// Enlace de baja del correo: desactiva los recordatorios del estudiante.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const usuarioId = usuarioDeEnlace(url.searchParams.get("u"));
  if (!usuarioId || !bdDisponible()) {
    return NextResponse.redirect(new URL("/", url.origin));
  }
  try {
    const sql = await db();
    await sql`UPDATE usuarios SET recordatorios_activos = FALSE WHERE id = ${usuarioId}`;
  } catch {
    // sin drama: la página de destino explica el estado
  }
  return NextResponse.redirect(new URL("/baja", url.origin));
}
