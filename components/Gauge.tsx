"use client";

import { motion } from "framer-motion";

// Medidor semicircular: la fracción se satura visualmente en `visualMax`
// para que puntajes bajos sigan siendo legibles en el arco.
export default function Gauge({
  score,
  visualMax = 32,
  danger,
}: {
  score: number;
  visualMax?: number;
  danger: boolean;
}) {
  const fraction = Math.max(0.02, Math.min(score / visualMax, 1));
  const color = danger ? "#D97706" : "#16A34A";

  return (
    <div className="relative mx-auto w-64 max-w-full">
      <svg viewBox="0 0 200 115" className="w-full">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.12}
          strokeWidth={16}
          strokeLinecap="round"
        />
        <motion.path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth={16}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: fraction }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, type: "spring", stiffness: 260, damping: 18 }}
          className="text-5xl font-bold"
          style={{ color }}
        >
          {score}
        </motion.div>
        <div className="text-xs font-semibold uppercase tracking-wider text-black/50">
          puntos CVS-Q
        </div>
      </div>
    </div>
  );
}
