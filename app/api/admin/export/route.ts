import { NextResponse } from "next/server";
import { bdDisponible, db } from "@/lib/db";
import { esCronAutorizado } from "@/lib/session";

export const dynamic = "force-dynamic";

// Exportación de datos a CSV (protegida con la clave del equipo). Permite
// entregar la información sin dar acceso a las cuentas de infraestructura:
// cada tabla se descarga como hoja de cálculo.
export async function GET(req: Request) {
  if (!esCronAutorizado(req)) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  if (!bdDisponible()) {
    return NextResponse.json({ ok: false, error: "Base de datos no configurada" }, { status: 503 });
  }
  const tabla = new URL(req.url).searchParams.get("tabla") ?? "";

  try {
    const sql = await db();
    let filas: Record<string, unknown>[];
    // Consultas explícitas por tabla (nunca se interpola el nombre)
    switch (tabla) {
      case "usuarios":
        filas = (await sql`
          SELECT id, nombre, correo, edad, ocupacion, correccion, horas_pantalla,
                 intervalo_min, recordatorios_activos, consentimiento,
                 creado AT TIME ZONE 'America/Bogota' AS creado_bogota
          FROM usuarios ORDER BY id`) as Record<string, unknown>[];
        break;
      case "bloques":
        filas = (await sql`
          SELECT usuario_id, dia, inicio, fin FROM bloques ORDER BY usuario_id, dia, inicio`) as Record<string, unknown>[];
        break;
      case "cvsq":
        filas = (await sql`
          SELECT usuario_id, puntaje, fecha AT TIME ZONE 'America/Bogota' AS fecha_bogota
          FROM cvsq ORDER BY usuario_id, fecha`) as Record<string, unknown>[];
        break;
      case "cumplimientos":
        filas = (await sql`
          SELECT usuario_id, ejercicio_id, fuente,
                 fecha AT TIME ZONE 'America/Bogota' AS fecha_bogota
          FROM cumplimientos ORDER BY fecha`) as Record<string, unknown>[];
        break;
      case "envios":
        filas = (await sql`
          SELECT usuario_id, fecha_dia, hora, ejercicio_id,
                 creado AT TIME ZONE 'America/Bogota' AS creado_bogota
          FROM envios ORDER BY creado`) as Record<string, unknown>[];
        break;
      default:
        return NextResponse.json(
          { ok: false, error: "Tabla desconocida. Opciones: usuarios, bloques, cvsq, cumplimientos, envios" },
          { status: 400 }
        );
    }

    const esc = (v: unknown) => {
      const s = v === null || v === undefined ? "" : String(v);
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const columnas = filas.length ? Object.keys(filas[0]) : [];
    const csv =
      "﻿" + // BOM: Excel abre acentos correctamente
      [columnas.join(","), ...filas.map((f) => columnas.map((c) => esc(f[c])).join(","))].join("\r\n");

    return new NextResponse(csv, {
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
