"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Sin historial del servidor (modo demo) se muestra la serie de ejemplo;
// con sesión real, cada punto es una medición CVS-Q guardada.
const DEMO = [
  { etiqueta: "Sem 1", puntaje: 18 },
  { etiqueta: "Sem 2", puntaje: 14 },
  { etiqueta: "Sem 3", puntaje: 10 },
  { etiqueta: "Sem 4", puntaje: 7 },
];

// Naranja de marca ajustado a la banda de luminosidad de marcas de datos
// (validado junto al teal en ambos temas).
const MARK = "#D9711C";

export default function SymptomChart({
  historial,
}: {
  historial?: { puntaje: number; fecha: string }[] | null;
}) {
  const ink = "#0E3B3B99";
  const grid = "#0E3B3B14";

  if (historial && historial.length < 2) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-ink/20 px-6 text-center text-sm text-ink/50">
        {historial.length === 0
          ? "Aún no hay mediciones del CVS-Q en tu historial."
          : "Tienes 1 medición. Repite el cuestionario la próxima semana para ver tu evolución."}
      </div>
    );
  }

  const DATA = historial
    ? historial.map((h) => ({ etiqueta: h.fecha.slice(5), puntaje: h.puntaje }))
    : DEMO;
  const maxY = Math.max(20, ...DATA.map((d) => d.puntaje));

  return (
    <div className="h-40 w-full" role="img" aria-label="Puntaje CVS-Q por medición">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={DATA} margin={{ top: 10, right: 8, left: -26, bottom: 0 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis
            dataKey="etiqueta"
            axisLine={false}
            tickLine={false}
            tick={{ fill: ink, fontSize: 11, fontWeight: 600 }}
          />
          <YAxis
            domain={[0, maxY]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: ink, fontSize: 11 }}
          />
          <Tooltip
            formatter={(v: number) => [`${v} puntos`, "CVS-Q"]}
            contentStyle={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 8px 24px rgba(0,0,0,.18)",
              background: "#ffffff",
              color: "#0E3B3B",
              fontSize: 12,
              fontFamily: "inherit",
            }}
          />
          <Line
            type="monotone"
            dataKey="puntaje"
            stroke={MARK}
            strokeWidth={2.5}
            dot={{ r: 4, fill: MARK, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
