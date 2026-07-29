import { NextResponse } from "next/server";
import { cerrarSesion } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  cerrarSesion();
  return NextResponse.redirect(new URL("/", new URL(req.url).origin));
}
