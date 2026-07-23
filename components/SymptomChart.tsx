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
import { useApp } from "./providers";

// Datos simulados: puntaje CVS-Q reportado por semana (tendencia a la baja).
const DATA = [
  { semana: "Sem 1", puntaje: 18 },
  { semana: "Sem 2", puntaje: 14 },
  { semana: "Sem 3", puntaje: 10 },
  { semana: "Sem 4", puntaje: 7 },
];

// Naranjas de marca ajustados a la banda de luminosidad de marcas de datos
// (validados junto al teal en ambos temas).
const MARK_LIGHT = "#D9711C";
const MARK_DARK = "#D9711C";

export default function SymptomChart() {
  const { dark } = useApp();
  const mark = dark ? MARK_DARK : MARK_LIGHT;
  const ink = dark ? "#94A3B8" : "#00000080";
  const grid = dark ? "#ffffff14" : "#00336614";

  return (
    <div className="h-40 w-full" role="img" aria-label="Puntaje CVS-Q reportado por semana">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={DATA} margin={{ top: 10, right: 8, left: -26, bottom: 0 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis
            dataKey="semana"
            axisLine={false}
            tickLine={false}
            tick={{ fill: ink, fontSize: 11, fontWeight: 600 }}
          />
          <YAxis
            domain={[0, 20]}
            ticks={[0, 10, 20]}
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
              background: dark ? "#0B1B2E" : "#ffffff",
              color: dark ? "#E2E8F0" : "#000000",
              fontSize: 12,
              fontFamily: "inherit",
            }}
          />
          <Line
            type="monotone"
            dataKey="puntaje"
            stroke={mark}
            strokeWidth={2.5}
            dot={{ r: 4, fill: mark, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
