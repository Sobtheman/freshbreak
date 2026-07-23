"use client";

// Recreación vectorial del ojo FreshBreak (versión "inmersión marina"):
// iris turquesa radiante con textura de radios, abanico de pestañas, ceja,
// líneas de luz irradiando y parpadeo periódico. Sustituir por el archivo
// vectorizado original si llega como archivo.

import { motion, useReducedMotion } from "framer-motion";

// Punto sobre la curva del párpado superior (para anclar pestañas)
function lidPoint(t: number) {
  // Bézier cuadrática: (150,300) → ctrl (460,140) → (790,300)
  const x = (1 - t) * (1 - t) * 150 + 2 * (1 - t) * t * 460 + t * t * 790;
  const y = (1 - t) * (1 - t) * 300 + 2 * (1 - t) * t * 140 + t * t * 300;
  return { x, y };
}

export function EyeHero({
  className = "",
  animated = true,
}: {
  className?: string;
  animated?: boolean;
}) {
  const reduce = useReducedMotion();
  const blink = animated && !reduce;

  // Pestañas superiores: más largas hacia la esquina exterior (derecha)
  const lashes = Array.from({ length: 12 }, (_, i) => {
    const t = 0.42 + (i / 11) * 0.55;
    const p = lidPoint(t);
    const len = 34 + Math.pow(i / 11, 1.6) * 96;
    const ang = -1.35 + (i / 11) * 1.05; // radianes, gira hacia fuera
    const tx = p.x + Math.cos(ang) * len;
    const ty = p.y + Math.sin(ang) * len - 14;
    const cx = p.x + Math.cos(ang - 0.5) * len * 0.55;
    const cy = p.y + Math.sin(ang - 0.5) * len * 0.55;
    return { p, tx, ty, cx, cy, w: 7 - (i / 11) * 2 };
  });

  const lower = Array.from({ length: 5 }, (_, i) => {
    const t = 0.6 + (i / 4) * 0.3;
    const x = (1 - t) * (1 - t) * 150 + 2 * (1 - t) * t * 470 + t * t * 790;
    const y = (1 - t) * (1 - t) * 300 + 2 * (1 - t) * t * 442 + t * t * 300;
    return { x, y, len: 16 + i * 5 };
  });

  // Radios del iris
  const spokes = Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2;
    const r1 = 40 + ((i * 13) % 5) * 2.4;
    const r2 = 88 - ((i * 7) % 4) * 3;
    return {
      x1: 470 + Math.cos(a) * r1,
      y1: 300 + Math.sin(a) * r1,
      x2: 470 + Math.cos(a) * r2,
      y2: 300 + Math.sin(a) * r2,
      light: i % 2 === 0,
    };
  });

  // Líneas de luz irradiando
  const rays = Array.from({ length: 26 }, (_, i) => {
    const a = (i / 26) * Math.PI * 2 + 0.12;
    const r1 = 170 + ((i * 29) % 40);
    const r2 = r1 + 60 + ((i * 53) % 150);
    return {
      x1: 470 + Math.cos(a) * r1,
      y1: 300 + Math.sin(a) * r1 * 0.72,
      x2: 470 + Math.cos(a) * r2,
      y2: 300 + Math.sin(a) * r2 * 0.72,
      o: 0.08 + ((i * 17) % 10) / 55,
    };
  });

  return (
    <svg viewBox="0 0 900 520" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="ehGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#40E0D0" stopOpacity="0.32" />
          <stop offset="55%" stopColor="#2CA7A0" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#2CA7A0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ehIris" cx="44%" cy="40%" r="62%">
          <stop offset="0%" stopColor="#CFFDF6" />
          <stop offset="28%" stopColor="#5FE5D6" />
          <stop offset="58%" stopColor="#17A9A2" />
          <stop offset="85%" stopColor="#0A5E62" />
          <stop offset="100%" stopColor="#053A44" />
        </radialGradient>
        <linearGradient id="ehSclera" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B9D9D6" />
          <stop offset="35%" stopColor="#EFF9F7" />
          <stop offset="100%" stopColor="#CBE5E1" />
        </linearGradient>
        <clipPath id="ehClip">
          <path d="M150 300 Q460 140 790 300 Q460 440 150 300 Z" />
        </clipPath>
      </defs>

      {/* halo detrás del ojo (doble capa para más atmósfera) */}
      <ellipse cx="470" cy="300" rx="420" ry="300" fill="url(#ehGlow)" opacity="0.7" />
      <ellipse cx="470" cy="300" rx="290" ry="200" fill="url(#ehGlow)" />

      {/* líneas de luz */}
      <g stroke="#40BFC0" strokeWidth="1.4">
        {rays.map((r, i) => (
          <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} strokeOpacity={r.o} />
        ))}
      </g>

      {/* globo ocular */}
      <path
        d="M150 300 Q460 140 790 300 Q460 440 150 300 Z"
        fill="url(#ehSclera)"
      />
      <g clipPath="url(#ehClip)">
        {/* sombra del párpado sobre la esclera */}
        <path d="M150 300 Q460 140 790 300 Q460 205 150 300 Z" fill="#0E3B3B" opacity="0.18" />
        {/* iris */}
        <circle cx="470" cy="300" r="95" fill="url(#ehIris)" />
        <g strokeWidth="2">
          {spokes.map((s, i) => (
            <line
              key={i}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke={s.light ? "#8FF3E6" : "#065B5C"}
              strokeOpacity={s.light ? 0.5 : 0.55}
            />
          ))}
        </g>
        <circle cx="470" cy="300" r="95" fill="none" stroke="#03333C" strokeWidth="7" strokeOpacity="0.9" />
        <circle cx="470" cy="300" r="38" fill="#03141C" />
        <circle cx="470" cy="300" r="42" fill="none" stroke="#0FDCC7" strokeWidth="2" strokeOpacity="0.35" />
        <ellipse cx="433" cy="258" rx="26" ry="17" fill="#FFFFFF" opacity="0.92" />
        <circle cx="512" cy="342" r="9" fill="#FFFFFF" opacity="0.5" />

        {/* lagrimal */}
        <path d="M154 300 C168 284 190 280 204 290 C190 306 172 312 158 308 Z" fill="#D8A0BC" opacity="0.85" />

        {/* párpado que parpadea */}
        <motion.g
          initial={false}
          animate={blink ? { y: [-310, -310, 0, -310, -310] } : { y: -310 }}
          transition={
            blink
              ? {
                  duration: 6,
                  times: [0, 0.93, 0.955, 0.98, 1],
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : undefined
          }
        >
          <path d="M100 -300 H840 V280 Q470 452 100 280 Z" fill="#0A3F40" />
          <path d="M100 280 Q470 452 840 280" fill="none" stroke="#062F31" strokeWidth="8" />
        </motion.g>
      </g>

      {/* pliegue del párpado */}
      <path
        d="M190 252 Q460 96 760 250"
        fill="none"
        stroke="#0E2A2E"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.65"
      />
      {/* línea de pestañas superior */}
      <path
        d="M150 300 Q460 140 790 300"
        fill="none"
        stroke="#0B1F24"
        strokeWidth="14"
        strokeLinecap="round"
      />
      {/* abanico de pestañas */}
      <g fill="#0B1F24">
        {lashes.map((l, i) => (
          <path
            key={i}
            d={`M ${l.p.x - l.w} ${l.p.y} Q ${l.cx} ${l.cy} ${l.tx} ${l.ty} Q ${l.cx + 6} ${l.cy + 8} ${l.p.x + l.w} ${l.p.y + 4} Z`}
          />
        ))}
      </g>
      {/* pestañas inferiores */}
      <g stroke="#0B1F24" strokeWidth="4" strokeLinecap="round" opacity="0.8">
        {lower.map((l, i) => (
          <line key={i} x1={l.x} y1={l.y} x2={l.x + l.len * 0.5} y2={l.y + l.len} />
        ))}
      </g>
      {/* línea inferior */}
      <path
        d="M210 342 Q470 470 760 330"
        fill="none"
        stroke="#0B1F24"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* ceja */}
      <path
        d="M200 178 C330 74 620 66 786 156 C640 110 400 122 252 200 C230 210 208 196 200 178 Z"
        fill="#0B1F24"
      />
    </svg>
  );
}

// Marca pequeña para el encabezado: el mismo ojo, recortado y simplificado.
export function EyeMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 60" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="emIris" cx="44%" cy="40%" r="62%">
          <stop offset="0%" stopColor="#CFFDF6" />
          <stop offset="40%" stopColor="#40E0D0" />
          <stop offset="75%" stopColor="#17A9A2" />
          <stop offset="100%" stopColor="#053A44" />
        </radialGradient>
      </defs>
      <path
        d="M6 32 Q48 4 90 32 Q48 56 6 32 Z"
        fill="#EFF9F7"
        stroke="currentColor"
        strokeWidth="4"
      />
      <circle cx="48" cy="31" r="13.5" fill="url(#emIris)" />
      <circle cx="48" cy="31" r="5.5" fill="#03141C" />
      <circle cx="44" cy="26" r="2.6" fill="#fff" opacity="0.9" />
      <path d="M70 14 L80 6 M78 20 L90 14 M83 28 L95 26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
