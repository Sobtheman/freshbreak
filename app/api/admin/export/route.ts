import { NextResponse } from "next/server";
import JSZip from "jszip";
import { bdDisponible, db } from "@/lib/db";
import { esCronAutorizado } from "@/lib/session";

export const dynamic = "force-dynamic";

// Exportación de datos (protegida con la clave del equipo). Cada tabla sale
// como CSV legible por sí solo (incluye nombre y correo del estudiante, no
// solo su id) y `tabla=todo` las entrega todas en un único ZIP. Así los
// datos se entregan completos sin compartir cuentas de infraestructura.

type Fila = Record<string, unknown>;

async function consultar(sql: Awaited<ReturnType<typeof db>>, tabla: string): Promise<Fila[] | null> {
  switch (tabla) {
    case "usuarios":
      return (await sql`
        SELECT id, nombre, correo, edad, ocupacion, correccion, horas_pantalla,
               intervalo_min, recordatorios_activos, consentimiento,
               creado AT TIME ZONE 'America/Bogota' AS creado_bogota,
               cierre_enviado AT TIME ZONE 'America/Bogota' AS cierre_enviado_bogota,
               cierre_recordado AT TIME ZONE 'America/Bogota' AS cierre_recordado_bogota
        FROM usuarios ORDER BY id`) as Fila[];
    case "bloques":
      return (await sql`
        SELECT u.nombre, u.correo, b.dia, b.inicio, b.fin
        FROM bloques b JOIN usuarios u ON u.id = b.usuario_id
        ORDER BY u.id, b.dia, b.inicio`) as Fila[];
    case "cvsq":
      return (await sql`
        SELECT u.nombre, u.correo, q.puntaje, q.momento,
               q.fecha AT TIME ZONE 'America/Bogota' AS fecha_bogota
        FROM cvsq q JOIN usuarios u ON u.id = q.usuario_id
        ORDER BY u.id, q.fecha`) as Fila[];
    case "sus":
      // Una columna por ítem (1 a 5) además del puntaje 0-100, para que el
      // análisis pueda rehacer el cálculo o mirar ítem por ítem.
      return (await sql`
        SELECT u.nombre, u.correo, s.puntaje::float AS puntaje_sus,
               (s.respuestas->>0)::int AS item1, (s.respuestas->>1)::int AS item2,
               (s.respuestas->>2)::int AS item3, (s.respuestas->>3)::int AS item4,
               (s.respuestas->>4)::int AS item5, (s.respuestas->>5)::int AS item6,
               (s.respuestas->>6)::int AS item7, (s.respuestas->>7)::int AS item8,
               (s.respuestas->>8)::int AS item9, (s.respuestas->>9)::int AS item10,
               s.fecha AT TIME ZONE 'America/Bogota' AS fecha_bogota
        FROM sus s JOIN usuarios u ON u.id = s.usuario_id
        ORDER BY s.fecha`) as Fila[];
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
    case "mensajes":
      return (await sql`
        SELECT nombre, correo, mensaje,
               creado AT TIME ZONE 'America/Bogota' AS creado_bogota
        FROM mensajes ORDER BY creado`) as Fila[];
    default:
      return null;
  }
}

// Las columnas *_bogota son `timestamp` sin zona (ya convertidas a hora de
// Bogotá en SQL). El driver las entrega como Date y String(date) producía
// "Wed Oct 28 2026 03:40:47 GMT+0000 (…)": Excel no lo reconoce como fecha y
// la etiqueta GMT es falsa. Se vuelve a escribir la hora tal cual, en un
// formato que Excel sí interpreta.
function fechaCsv(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  const dia = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  if (!d.getHours() && !d.getMinutes() && !d.getSeconds() && !d.getMilliseconds()) return dia;
  return `${dia} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function aCsv(filas: Fila[]): string {
  const esc = (v: unknown) => {
    const s =
      v === null || v === undefined ? "" : v instanceof Date ? fechaCsv(v) : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const columnas = filas.length ? Object.keys(filas[0]) : [];
  // BOM para que Excel abra los acentos correctamente
  return (
    "﻿" +
    [columnas.join(","), ...filas.map((f) => columnas.map((c) => esc(f[c])).join(","))].join("\r\n")
  );
}

const TABLAS = ["usuarios", "bloques", "cvsq", "sus", "cumplimientos", "envios", "mensajes"];

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
        { ok: false, error: "Tabla desconocida. Opciones: todo, usuarios, bloques, cvsq, sus, cumplimientos, envios, mensajes" },
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
