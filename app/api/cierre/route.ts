import { NextResponse } from "next/server";
import { bdDisponible, db } from "@/lib/db";
import { usuarioDeEnlace, usuarioDeSesion } from "@/lib/session";
import { calcularPuntaje, respuestasCvsqValidas } from "@/lib/cvsq";
import { puntajeSUS, susValidas } from "@/lib/sus";
import { estadoCierre } from "@/lib/estudio";

export const dynamic = "force-dynamic";

// Evaluación final del estudio: CVS-Q de cierre + escala SUS. Se puede
// responder con sesión o desde el enlace del correo de cierre (?u=), que
// identifica al estudiante sin iniciar sesión, igual que el registro de
// pausas desde los recordatorios.

function identificar(token: string | null): number | null {
  return usuarioDeEnlace(token) ?? usuarioDeSesion();
}

async function cargar(usuarioId: number) {
  const sql = await db();
  const filas = (await sql`
    SELECT u.nombre, u.creado, u.cierre_enviado,
           EXISTS (SELECT 1 FROM sus s WHERE s.usuario_id = u.id) AS completado,
           (SELECT q.puntaje FROM cvsq q WHERE q.usuario_id = u.id
             ORDER BY q.fecha ASC LIMIT 1) AS cvsq_inicial
    FROM usuarios u WHERE u.id = ${usuarioId}
  `) as {
    nombre: string;
    creado: string;
    cierre_enviado: string | null;
    completado: boolean;
    cvsq_inicial: number | null;
  }[];
  return { sql, u: filas[0] ?? null };
}

export async function GET(req: Request) {
  if (!bdDisponible()) {
    return NextResponse.json({ ok: false, error: "Base de datos no configurada" }, { status: 503 });
  }
  const usuarioId = identificar(new URL(req.url).searchParams.get("u"));
  if (!usuarioId) {
    return NextResponse.json({ ok: false, error: "sin_identificar" }, { status: 401 });
  }
  try {
    const { u } = await cargar(usuarioId);
    if (!u) return NextResponse.json({ ok: false, error: "Usuario no existe" }, { status: 404 });
    return NextResponse.json({
      ok: true,
      nombre: u.nombre.split(" ")[0],
      cvsqInicial: u.cvsq_inicial,
      ...estadoCierre(u.creado, u.cierre_enviado, u.completado),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error de base de datos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!bdDisponible()) {
    return NextResponse.json({ ok: false, error: "Base de datos no configurada" }, { status: 503 });
  }
  let body: { u?: string; cvsq?: unknown; sus?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }
  const usuarioId = identificar(body.u ?? null);
  if (!usuarioId) {
    return NextResponse.json({ ok: false, error: "sin_identificar" }, { status: 401 });
  }
  if (!respuestasCvsqValidas(body.cvsq) || !susValidas(body.sus)) {
    return NextResponse.json({ ok: false, error: "Respuestas incompletas" }, { status: 400 });
  }

  try {
    const { sql, u } = await cargar(usuarioId);
    if (!u) return NextResponse.json({ ok: false, error: "Usuario no existe" }, { status: 404 });
    const estado = estadoCierre(u.creado, u.cierre_enviado, u.completado);
    if (!estado.disponible) {
      return NextResponse.json({ ok: false, error: "aun_no", ...estado }, { status: 403 });
    }

    // Los puntajes se calculan aquí, no en el navegador.
    const cvsqFinal = calcularPuntaje(body.cvsq);
    const sus = puntajeSUS(body.sus);

    // La fila de SUS es única por estudiante: reclamarla primero impide que
    // un doble envío deje dos mediciones finales.
    const claim = (await sql`
      INSERT INTO sus (usuario_id, puntaje, respuestas)
      VALUES (${usuarioId}, ${sus}, ${JSON.stringify(body.sus)})
      ON CONFLICT (usuario_id) DO NOTHING
      RETURNING id
    `) as { id: number }[];
    if (!claim.length) {
      return NextResponse.json({ ok: false, error: "ya_respondida" }, { status: 409 });
    }
    try {
      await sql`
        INSERT INTO cvsq (usuario_id, puntaje, respuestas, momento)
        VALUES (${usuarioId}, ${cvsqFinal}, ${JSON.stringify(body.cvsq)}, 'final')
      `;
    } catch (e) {
      await sql`DELETE FROM sus WHERE id = ${claim[0].id}`;
      throw e;
    }

    return NextResponse.json({ ok: true, cvsqInicial: u.cvsq_inicial, cvsqFinal });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error de base de datos" },
      { status: 500 }
    );
  }
}
