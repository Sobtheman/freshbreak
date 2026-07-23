"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "./providers";

// Datos simulados de cumplimiento semanal (promedio 71 %).
const DATA = [
  { dia: "L", pct: 80 },
  { dia: "M", pct: 60 },
  { dia: "X", pct: 90 },
  { dia: "J", pct: 55 },
  { dia: "V", pct: 75 },
  { dia: "S", pct: 40 },
  { dia: "D", pct: 97 },
];

// Teales de marca ajustados a la banda de luminosidad de marcas de datos
// (validados junto al naranja para contraste y visión del color en ambos temas).
const MARK_LIGHT = "#17A398";
const MARK_DARK = "#14A292";

export default function ComplianceChart() {
  const { dark } = useApp();
  const mark = dark ? MARK_DARK : MARK_LIGHT;
  const ink = dark ? "#94A3B8" : "#00000080";

  return (
    <div className="h-40 w-full" role="img" aria-label="Cumplimiento por día de la semana">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={DATA} margin={{ top: 8, right: 0, left: -26, bottom: 0 }} barCategoryGap="28%">
          <XAxis
            dataKey="dia"
            axisLine={false}
            tickLine={false}
            tick={{ fill: ink, fontSize: 12, fontWeight: 600 }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: ink, fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: dark ? "#ffffff14" : "#00336614" }}
            formatter={(v: number) => [`${v} %`, "Cumplimiento"]}
            labelFormatter={(l: string) =>
              ({ L: "Lunes", M: "Martes", X: "Miércoles", J: "Jueves", V: "Viernes", S: "Sábado", D: "Domingo" }[l] ?? l)
            }
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
          <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
            {DATA.map((d) => (
              <Cell key={d.dia} fill={mark} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
