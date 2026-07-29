import { NextResponse } from "next/server";
import JSZip from "jszip";
import { bdDisponible, db } from "@/lib/db";
import { esCronAutorizado } from "@/lib/session";

export const dynamic = "force-dynamic";

// Exportación de datos (protegida con la clave del equipo). Cada tabla sale
// como CSV legible por sí solo (incluye nombre y correo del estudiante, no
// solo su id) y `tabla=todo` entrega las cinco en un único ZIP. Así los
// datos se entregan completos sin compartir cuentas de infraestructura.

type Fila = Record<string, unknown>;

async function consultar(sql: Awaited<ReturnType<typeof db>>, tabla: string): Promise<Fila[] | null> {
  switch (tabla) {
    case "usuarios":
      return (await sql`
        SELECT id, nombre, correo, edad, ocupacion, correccion, horas_pantalla,
               intervalo_min, recordatorios_activos, consentimiento,
               creado AT TIME ZONE 'America/Bogota' AS creado_bogota
        FROM usuarios ORDER BY id`) as Fila[];
    case "bloques":
      return (await sql`
        SELECT u.nombre, u.correo, b.dia, b.inicio, b.fin
        FROM bloques b JOIN usuarios u ON u.id = b.usuario_id
        ORDER BY u.id, b.dia, b.inicio`) as Fila[];
    case "cvsq":
      return (await sql`
        SELECT u.nombre, u.correo, q.puntaje,
               q.fecha AT TIME ZONE 'America/Bogota' AS fecha_bogota
        FROM cvsq q JOIN usuarios u ON u.id = q.usuario_id
        ORDER BY u.id, q.fecha`) as Fila[];
    case "cumplimientos":
      return (await sql`
        SELECT u.nombre, u.correo, c.ejercicio_id, c.fuente,
               c.fecha AT TIME ZONE 'America/Bogota' AS fecha_bogota
        FROM cumplimientos c JOIN usuarios u ON u.id = c.usuario_id
        ORDER BY c.fecha`) as Fila[];
    case "envios":
      return (await sql`
        SELECT u.nombre, u.correo, e.fecha_dia, e.hora, e.ejercicio_id,
               e.creado AT TIME ZONE 'America/Bogota' AS creado_bogota
        FROM envios e JOIN usuarios u ON u.id = e.usuario_id
        ORDER BY e.creado`) as Fila[];
    default:
      return null;
  }
}

function aCsv(filas: Fila[]): string {
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const columnas = filas.length ? Object.keys(filas[0]) : [];
  // BOM para que Excel abra los acentos correctamente
  return (
    "﻿" +
    [columnas.join(","), ...filas.map((f) => columnas.map((c) => esc(f[c])).join(","))].join("\r\n")
  );
}

const TABLAS = ["usuarios", "bloques", "cvsq", "cumplimientos", "envios"];

export async function GET(req: Request) {
  if (!esCronAutorizado(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  if (!bdDisponible()) {
    return NextResponse.json({ ok: false, error: "Base de datos no configurada" }, { status: 503 });
  }
  const tabla = new URL(req.url).searchParams.get("tabla") ?? "todo";

  try {
    const sql = await db();

    if (tabla === "todo") {
      const zip = new JSZip();
      for (const t of TABLAS) {
        const filas = await consultar(sql, t);
        zip.file(`freshbreak_${t}.csv`, aCsv(filas ?? []));
      }
      const fecha = new Date().toISOString().slice(0, 10);
      const buf = await zip.generateAsync({ type: "nodebuffer" });
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="freshbreak_datos_${fecha}.zip"`,
        },
      });
    }

    const filas = await consultar(sql, tabla);
    if (filas === null) {
      return NextResponse.json(
        { ok: false, error: "Tabla desconocida. Opciones: todo, usuarios, bloques, cvsq, cumplimientos, envios" },
        { status: 400 }
      );
    }
    return new NextResponse(aCsv(filas), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="freshbreak_${tabla}.csv"`,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error de base de datos" },
      { status: 500 }
    );
  }
}
