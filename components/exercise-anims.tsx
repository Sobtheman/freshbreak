"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationFrame } from "framer-motion";

/*
 * Guías visuales v3. Patrones de las apps de entrenamiento ocular guiado:
 *  - seguimiento suave: punto a velocidad LINEAL constante (parametrizado por
 *    longitud de arco, no por ángulo)
 *  - parpadeo: párpado real que baja y sube al ritmo del ejercicio (2 s cerrado)
 *  - acomodación: la pantalla marca el ritmo SIN exigir mirarla fija
 *  - relajación (ojos cerrados): la guía enseña la preparación y acompaña
 *  - 20-20-20: la pantalla se apaga para empujar la mirada fuera de ella
 */

const DOT_STYLE: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: "50%",
  background: "#F79A56",
  boxShadow:
    "0 0 0 2px rgba(255,255,255,0.55), 0 0 18px rgba(247,154,86,0.85), 0 0 34px rgba(247,154,86,0.35)",
  willChange: "transform",
};

function useSegundos() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const iv = window.setInterval(() => setT((x) => x + 1), 1000);
    return () => window.clearInterval(iv);
  }, []);
  return t;
}

/* ---------- 1. Parpadeo consciente ----------
 * Ciclo por parpadeo: 4 s (abierto 2 s, cerrado 2 s) × 10 reps = 40 s,
 * descanso 10 s → ronda de 50 s; el párpado es una tapa real que baja. */
export function ParpadeoAnim() {
  const t = useSegundos();
  const enRonda = t % 50;
  const parpadeando = enRonda < 40;
  const rep = parpadeando ? Math.floor(enRonda / 4) + 1 : 10;
  const cerrado = parpadeando && enRonda % 4 >= 2;
  const ronda = Math.floor(t / 50) + 1;

  return (
    <div className="flex flex-col items-center gap-5">
      <svg width="220" height="140" viewBox="0 0 220 140" aria-hidden>
        <defs>
          <clipPath id="ojoClip">
            <path d="M20 70 Q110 -14 200 70 Q110 154 20 70 Z" />
          </clipPath>
        </defs>
        {/* globo ocular */}
        <path
          d="M20 70 Q110 -14 200 70 Q110 154 20 70 Z"
          className="fill-white dark:fill-slate-200"
        />
        <g clipPath="url(#ojoClip)">
          <circle cx="110" cy="70" r="34" className="fill-brand-tealDark dark:fill-brand-teal" />
          <circle cx="110" cy="70" r="15" fill="#071A2B" />
          <ellipse cx="99" cy="57" rx="9" ry="7" fill="#fff" opacity="0.95" />
          {/* párpado: tapa que baja de verdad (2 s cerrado / 2 s abierto) */}
          <motion.g
            animate={{ y: cerrado ? 0 : -150 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          >
            <path
              d="M-10 -90 H230 V64 Q110 118 -10 64 Z"
              className="fill-brand-tealDeep dark:fill-[#0a3f3a]"
            />
            {/* pestañas de la tapa */}
            <g className="stroke-brand-tealDeep dark:stroke-[#0a3f3a]" strokeWidth="4" strokeLinecap="round">
              <path d="M60 84 L52 98 M110 92 L110 108 M160 84 L168 98" />
            </g>
          </motion.g>
        </g>
        {/* contorno */}
        <path
          d="M20 70 Q110 -14 200 70 Q110 154 20 70 Z"
          fill="none"
          className="stroke-[#0E2A47] dark:stroke-slate-300"
          strokeWidth="6"
        />
      </svg>

      <div className="text-center">
        <AnimatePresence mode="wait">
          {parpadeando ? (
            <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-2xl font-bold tabular-nums">
                Parpadeo {rep} / 10 ·{" "}
                <span className={cerrado ? "text-brand-tealDark dark:text-brand-teal" : "text-brand-orangeDark dark:text-brand-orange"}>
                  {cerrado ? "cierra…" : "abre"}
                </span>
              </p>
              <p className="text-sm text-black/60 dark:text-slate-400">
                Ronda {ronda} · 2 segundos cerrado, 2 segundos abierto
              </p>
            </motion.div>
          ) : (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-2xl font-bold text-brand-orangeDark dark:text-brand-orange">
                Descansa… {50 - enRonda} s
              </p>
              <p className="text-sm text-black/60 dark:text-slate-400">
                Ojos abiertos y relajados antes de la siguiente ronda
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- 2. Regla 20-20-20 ----------
 * 5 s de preparación con la pantalla encendida → 20 s con la pantalla
 * atenuada (horizonte lejano + anillo) → cierre. */
export function Regla202020Anim() {
  const t = useSegundos();
  const fase: "prep" | "lejos" | "fin" = t < 5 ? "prep" : t < 25 ? "lejos" : "fin";
  const C = 2 * Math.PI * 44;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ minHeight: 290 }}>
      {/* la pantalla se apaga: fondo que pasa de claro a anochecer */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: fase === "lejos" ? 1 : 0 }}
        transition={{ duration: 1.2 }}
        style={{ background: "linear-gradient(180deg,#1B2A4A,#27436B 60%,#101C33)" }}
      />
      <motion.div
        className="absolute inset-0 bg-brand-bg dark:bg-brand-dark"
        animate={{ opacity: fase === "lejos" ? 0 : 1 }}
        transition={{ duration: 1.2 }}
      />
      {/* horizonte (sol pálido, sin naranja: el naranja es "sígueme") */}
      <motion.svg
        className="absolute inset-x-0 bottom-0 h-2/3 w-full"
        viewBox="0 0 400 160"
        preserveAspectRatio="none"
        aria-hidden
        animate={{ opacity: fase === "lejos" ? 1 : 0 }}
        transition={{ duration: 1.2 }}
      >
        <circle cx="316" cy="52" r="20" fill="#F3EAC8" opacity="0.9" />
        <circle cx="316" cy="52" r="32" fill="#F3EAC8" opacity="0.15" />
        <path d="M0 96 L400 88" stroke="#8FB8D8" strokeWidth="2" opacity="0.5" />
        <path d="M0 160 L0 110 Q80 84 170 104 T400 96 L400 160 Z" fill="#0C1830" />
        <path d="M0 160 L0 128 Q120 104 230 122 T400 116 L400 160 Z" fill="#070F20" />
      </motion.svg>

      <div className="relative z-10 flex min-h-[290px] flex-col items-center justify-center gap-4 p-5">
        {fase === "prep" && (
          <motion.div
            key="prep"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="text-lg font-bold">🔭 Busca tu objeto lejano</p>
            <p className="mt-1 text-sm text-black/60 dark:text-slate-400">
              Una ventana o el punto más lejano de la habitación (6 m), bien iluminado.
            </p>
            <p className="mt-4 text-6xl font-bold tabular-nums text-brand-tealDark dark:text-brand-teal">
              {5 - t}
            </p>
          </motion.div>
        )}
        {fase === "lejos" && (
          <motion.div
            key="lejos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 text-white"
          >
            <div className="relative">
              <svg width="112" height="112" viewBox="0 0 100 100" className="-rotate-90">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#ffffff26" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="44" fill="none"
                  stroke="#F79A56" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={C}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: C }}
                  transition={{ duration: 20, ease: "linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold tabular-nums">
                {25 - t}
              </div>
            </div>
            <p className="font-semibold">👀 Mira el horizonte, no la pantalla</p>
            <p className="text-xs text-white/60">La pantalla descansa contigo</p>
          </motion.div>
        )}
        {fase === "fin" && (
          <motion.div
            key="fin"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="text-4xl">✅</p>
            <p className="mt-2 text-lg font-bold">¡Listo! Parpadea suavemente</p>
            <p className="mt-1 text-sm text-black/60 dark:text-slate-400">
              Marca la pausa como cumplida.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ---------- 3. Ocho horizontal (∞) ----------
 * Velocidad LINEAL constante mediante tabla de longitud de arco.
 * 30 s en un sentido → descanso 10 s → 30 s en sentido contrario. */
export function OchoAnim() {
  const boxRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const sFrac = useRef(0);
  const fase = useRef<"ida" | "pausa" | "vuelta">("ida");
  const enFase = useRef(0);
  const [caption, setCaption] = useState<"ida" | "pausa" | "vuelta">("ida");

  // Tabla de longitud de arco de la lemniscata (relación de aspecto ~0.55)
  const LUT = useMemo(() => {
    const N = 720;
    const xs: number[] = [];
    const ys: number[] = [];
    const cum: number[] = [0];
    for (let i = 0; i <= N; i++) {
      const th = (i / N) * Math.PI * 2;
      xs.push(0.4 * Math.sin(th));
      ys.push(0.38 * 0.55 * Math.sin(2 * th));
      if (i > 0) {
        cum.push(cum[i - 1] + Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]));
      }
    }
    return { N, cum, total: cum[N] };
  }, []);

  // fracción de recorrido (0-1) → ángulo de la curva, interpolado
  function thetaDe(frac: number) {
    const objetivo = ((frac % 1) + 1) % 1 * LUT.total;
    let lo = 0, hi = LUT.N;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (LUT.cum[mid] < objetivo) lo = mid + 1;
      else hi = mid;
    }
    const i = Math.max(1, lo);
    const seg = LUT.cum[i] - LUT.cum[i - 1] || 1;
    const f = (objetivo - LUT.cum[i - 1]) / seg;
    return ((i - 1 + f) / LUT.N) * Math.PI * 2;
  }

  useAnimationFrame((_, delta) => {
    const box = boxRef.current;
    const dot = dotRef.current;
    if (!box || !dot) return;
    const dt = Math.min(delta, 64) / 1000;
    enFase.current += dt;

    if (fase.current === "ida" && enFase.current >= 30) {
      fase.current = "pausa";
      enFase.current = 0;
      setCaption("pausa");
    } else if (fase.current === "pausa" && enFase.current >= 10) {
      fase.current = "vuelta";
      enFase.current = 0;
      setCaption("vuelta");
    } else if (fase.current === "vuelta" && enFase.current >= 30) {
      fase.current = "ida";
      enFase.current = 0;
      setCaption("ida");
    }

    if (fase.current !== "pausa") {
      const dir = fase.current === "ida" ? 1 : -1;
      sFrac.current += (dir * dt) / 6; // una vuelta completa cada 6 s, velocidad constante
    }
    const th = thetaDe(sFrac.current);
    const w = box.clientWidth;
    const h = box.clientHeight;
    const x = w / 2 + w * 0.4 * Math.sin(th);
    const y = h / 2 + h * 0.38 * Math.sin(2 * th);
    dot.style.transform = `translate(${x - 12}px, ${y - 12}px)`;
  });

  const puntos = useMemo(() => {
    const pts: string[] = [];
    for (let th = 0; th <= Math.PI * 2 + 0.001; th += 0.04) {
      pts.push(`${(50 + 40 * Math.sin(th)).toFixed(2)},${(30 + 22.8 * Math.sin(2 * th)).toFixed(2)}`);
    }
    return pts.join(" ");
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        ref={boxRef}
        className="relative h-64 w-full overflow-hidden rounded-2xl bg-brand-bg dark:bg-brand-dark"
      >
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden>
          <polyline
            points={puntos}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.18"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div ref={dotRef} className="absolute left-0 top-0 will-change-transform">
          <motion.div
            style={DOT_STYLE}
            animate={caption === "pausa" ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={caption === "pausa" ? { duration: 2, repeat: Infinity } : { duration: 0.3 }}
          />
        </div>
        {caption === "pausa" && (
          <div className="absolute inset-x-0 top-4 text-center">
            <span className="rounded-full bg-brand-orange px-4 py-1.5 text-sm font-bold text-[#0E2A47]">
              Descansa 10 s · cierra los ojos un momento
            </span>
          </div>
        )}
      </div>
      <p className="text-center text-sm font-medium">
        Cabeza quieta: sigue el punto naranja solo con los ojos
        {caption !== "pausa" && <> · <b>{caption === "ida" ? "sentido →" : "sentido ←"}</b></>}
      </p>
    </div>
  );
}

/* ---------- 4. Enfoque cercano-lejano ----------
 * Tus ojos van al dedo (15 cm) o al objeto lejano — NO a la pantalla.
 * La pantalla es el metrónomo: conteo gigante legible de reojo. */
export function EnfoqueAnim() {
  const t = useSegundos();
  const enCiclo = t % 20;
  const cerca = enCiclo < 10;
  const restante = cerca ? 10 - enCiclo : 20 - enCiclo;
  const ciclo = Math.min(Math.floor(t / 20) + 1, 10);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <motion.div
        className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-2xl transition-colors duration-1000"
        animate={{
          backgroundColor: cerca ? "rgba(247,154,86,0.14)" : "rgba(46,196,182,0.14)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={cerca ? "c" : "l"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xl font-bold sm:text-2xl"
          >
            {cerca ? "👆 CERCA — enfoca tu dedo (15 cm)" : "🏔️ LEJOS — objeto a 6 m"}
          </motion.p>
        </AnimatePresence>
        {/* conteo gigante: legible con visión periférica */}
        <p
          className={`font-mono text-8xl font-bold tabular-nums ${
            cerca
              ? "text-brand-orangeDark dark:text-brand-orange"
              : "text-brand-tealDark dark:text-brand-teal"
          }`}
        >
          {restante}
        </p>
        {/* pacer periférico: crece cerca, se encoge lejos */}
        <motion.div
          animate={{ width: cerca ? 72 : 20, height: cerca ? 72 : 20, opacity: cerca ? 1 : 0.7 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          style={{
            borderRadius: "50%",
            background: "#F79A56",
            boxShadow: "0 0 0 2px rgba(255,255,255,0.5), 0 0 20px rgba(247,154,86,0.7)",
          }}
        />
      </motion.div>
      <p className="text-sm text-black/60 dark:text-slate-400">
        Ciclo {ciclo} / 10 · no mires fijo la pantalla: el conteo es tu metrónomo
      </p>
    </div>
  );
}

/* ---------- Manos SVG compartidas (5 y 6) ---------- */
function ManosGuia({ fase }: { fase: "frotar" | "colocar" }) {
  return (
    <svg width="240" height="150" viewBox="0 0 240 150" aria-hidden>
      {/* ojos cerrados */}
      <g
        className="stroke-[#0E2A47] dark:stroke-slate-300"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M62 38 Q82 52 102 38" />
        <path d="M138 38 Q158 52 178 38" />
      </g>
      {/* palmas */}
      <motion.g
        animate={
          fase === "frotar"
            ? { x: [-10, 10, -10], y: 84 }
            : { x: 0, y: 8 }
        }
        transition={
          fase === "frotar"
            ? { x: { duration: 1.1, repeat: Infinity, ease: "easeInOut" }, y: { duration: 0.4 } }
            : { duration: 1.4, ease: "easeInOut" }
        }
      >
        <rect x="52" y="0" width="56" height="76" rx="26" fill="#F7C08A" className="dark:opacity-90" stroke="#C05E14" strokeWidth="3.5" />
      </motion.g>
      <motion.g
        animate={
          fase === "frotar"
            ? { x: [10, -10, 10], y: 84 }
            : { x: 0, y: 8 }
        }
        transition={
          fase === "frotar"
            ? { x: { duration: 1.1, repeat: Infinity, ease: "easeInOut" }, y: { duration: 0.4 } }
            : { duration: 1.4, ease: "easeInOut" }
        }
      >
        <rect x="132" y="0" width="56" height="76" rx="26" fill="#F7C08A" className="dark:opacity-90" stroke="#C05E14" strokeWidth="3.5" />
      </motion.g>
      {/* calor al frotar */}
      {fase === "frotar" && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="stroke-brand-orange"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        >
          <path d="M108 70 q4 -8 0 -16" />
          <path d="M120 74 q4 -8 0 -16" />
          <path d="M132 70 q4 -8 0 -16" />
        </motion.g>
      )}
    </svg>
  );
}

/* ---------- 5. Masaje palpebral con calor ----------
 * 0-10 s: frota las manos (animado) → 10-40 s: palmas sobre los párpados
 * con marcapasos de respiración. */
export function MasajeAnim() {
  const t = useSegundos();
  const fase: "frotar" | "colocar" = t < 10 ? "frotar" : "colocar";
  const inhala = t % 8 < 4;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 dark:from-[#2a1c0a] dark:to-[#3a2810]">
        <motion.div
          animate={fase === "colocar" ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={fase === "colocar" ? { duration: 8, repeat: Infinity, ease: "easeInOut" } : {}}
        >
          <ManosGuia fase={fase} />
        </motion.div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={fase === "frotar" ? "f" : inhala ? "i" : "e"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-lg font-bold"
        >
          {fase === "frotar"
            ? `🤲 Frota tus manos hasta calentarlas… ${10 - t} s`
            : inhala
              ? "Palmas sobre los párpados · Inhala profundo…"
              : "Círculos suaves, sin presionar · Exhala…"}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/* ---------- 6. Palming ----------
 * 0-5 s: guía de colocación → oscuridad casi total con respiración apenas
 * visible → salida calmada en los últimos segundos. */
export function PalmingAnim() {
  const t = useSegundos();
  const fase: "prep" | "oscuro" | "salida" = t < 5 ? "prep" : t < 54 ? "oscuro" : "salida";
  const inhala = t % 8 < 4;

  return (
    <motion.div
      animate={{
        backgroundColor:
          fase === "prep"
            ? "rgba(3,6,12,0)"
            : fase === "oscuro"
              ? "rgba(3,6,12,0.97)"
              : "rgba(16,30,52,0.55)",
      }}
      transition={{ duration: fase === "salida" ? 4 : 2.5, ease: "easeInOut" }}
      className="flex w-full flex-col items-center gap-5 rounded-2xl px-4 py-8"
    >
      {fase === "prep" ? (
        <>
          <ManosGuia fase="colocar" />
          <p className="text-lg font-bold">
            Cubre tus ojos con las palmas… {5 - t} s
          </p>
          <p className="text-sm text-black/60 dark:text-slate-400">
            Sin presionar los globos oculares; bloquea toda la luz.
          </p>
        </>
      ) : (
        <>
          <motion.div
            animate={{
              scale: [1, 1.6, 1],
              opacity: fase === "salida" ? [0.45, 0.65, 0.45] : [0.15, 0.35, 0.15],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="h-28 w-28 rounded-full bg-[#123657] shadow-[0_0_60px_rgba(30,84,134,0.5)]"
          />
          <AnimatePresence mode="wait">
            <motion.p
              key={fase === "salida" ? "s" : inhala ? "i" : "e"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-lg font-bold text-slate-300"
            >
              {fase === "salida"
                ? "Retira las manos lentamente y abre los ojos…"
                : inhala
                  ? "Inhala… el círculo crece"
                  : "Exhala… el círculo se encoge"}
            </motion.p>
          </AnimatePresence>
          <p className="max-w-xs text-center text-sm text-slate-500">
            Oscuridad total · respira lento y profundo
          </p>
        </>
      )}
    </motion.div>
  );
}

/* ---------- 7. Push up pencil ----------
 * El punto hace de lápiz: horizontal 30 s → vertical 30 s, velocidad constante. */
export function PencilAnim() {
  const boxRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const t = useRef(0);
  const elapsed = useRef(0);
  const [eje, setEje] = useState<"x" | "y">("x");

  useAnimationFrame((_, delta) => {
    const box = boxRef.current;
    const dot = dotRef.current;
    if (!box || !dot) return;
    const dt = Math.min(delta, 64) / 1000;
    elapsed.current += dt;
    if (eje === "x" && elapsed.current >= 30) {
      setEje("y");
      t.current = 0;
    }
    t.current += dt * ((Math.PI * 2) / 8);
    const tri = (2 / Math.PI) * Math.asin(Math.sin(t.current));
    const w = box.clientWidth;
    const h = box.clientHeight;
    const hx = w / 2 - 16;
    const hy = h / 2 - 16;
    const x = w / 2 + (eje === "x" ? tri * hx : 0);
    const y = h / 2 + (eje === "y" ? tri * hy : 0);
    dot.style.transform = `translate(${x - 12}px, ${y - 12}px)`;
  });

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        ref={boxRef}
        className="relative h-64 w-full overflow-hidden rounded-2xl bg-brand-bg dark:bg-brand-dark"
      >
        <div ref={dotRef} className="absolute left-0 top-0" style={DOT_STYLE} />
      </div>
      <p className="text-center text-sm font-medium">
        El punto hace de lápiz: síguelo sin mover la cabeza ·{" "}
        <b>{eje === "x" ? "izquierda ↔ derecha" : "arriba ↕ abajo"}</b>
      </p>
    </div>
  );
}

export const ANIMACIONES: Record<string, () => JSX.Element> = {
  "parpadeo-consciente": ParpadeoAnim,
  "regla-20-20-20": Regla202020Anim,
  "ocho-horizontal": OchoAnim,
  "enfoque-cercano-lejano": EnfoqueAnim,
  "masaje-palpebral": MasajeAnim,
  palming: PalmingAnim,
  "push-up-pencil": PencilAnim,
};
