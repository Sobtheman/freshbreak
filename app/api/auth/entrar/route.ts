import { NextResponse } from "next/server";
import { crearSesion, usuarioDeLogin } from "@/lib/session";

export const dynamic = "force-dynamic";

// Destino del enlace mágico: valida el token, abre sesión y lleva al panel.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const usuarioId = usuarioDeLogin(url.searchParams.get("token"));
  if (!usuarioId) {
    return NextResponse.redirect(new URL("/entrar?error=expirado", url.origin));
  }
  crearSesion(usuarioId);
  return NextResponse.redirect(new URL("/panel", url.origin));
}
