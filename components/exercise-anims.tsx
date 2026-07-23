"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationFrame } from "framer-motion";

/*
 * Guías visuales por ejercicio, basadas en los patrones estándar de las apps
 * de entrenamiento ocular guiado:
 *  - seguimiento suave (smooth pursuit): punto en movimiento a velocidad constante
 *  - entrenamiento de parpadeo: icono de ojo con ritmo marcado y contador
 *  - acomodación: simulación de profundidad (escala + desenfoque)
 *  - relajación: círculo marcapasos de respiración (crece=inhala, se contrae=exhala)
 *  - 20-20-20: guiar la mirada FUERA de la pantalla (atenuación + horizonte)
 */

// Punto de seguimiento compartido: 24 px, naranja de marca, halo suave.
const DOT_STYLE: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: "50%",
  background: "#F79A56",
  boxShadow:
    "0 0 0 2px rgba(255,255,255,0.55), 0 0 18px rgba(247,154,86,0.85), 0 0 34px rgba(247,154,86,0.35)",
  willChange: "transform",
};

/* ---------- 1. Parpadeo consciente (ojo animado + contador sincronizado) ---------- */
export function ParpadeoAnim() {
  const [t, setT] = useState(0);

  useEffect(() => {
    const iv = window.setInterval(() => setT((x) => x + 1), 1000);
    return () => window.clearInterval(iv);
  }, []);

  // Ciclo de 30 s: 20 s de parpadeo (10 reps × 2 s) + 10 s de descanso.
  const enCiclo = t % 30;
  const parpadeando = enCiclo < 20;
  const rep = parpadeando ? Math.floor(enCiclo / 2) + 1 : 10;
  const ronda = Math.floor(t / 30) + 1;
  const descansoRestante = 30 - enCiclo;

  return (
    <div className="flex flex-col items-center gap-5">
      <motion.div
        animate={
          parpadeando
            ? { scaleY: [1, 1, 0.05, 0.05, 1, 1] }
            : { scaleY: 1 }
        }
        transition={
          parpadeando
            ? {
                duration: 2,
                times: [0, 0.3, 0.42, 0.56, 0.68, 1],
                repeat: Infinity,
                ease: "easeInOut",
              }
            : { duration: 0.4 }
        }
        className="origin-center"
      >
        <svg width="210" height="130" viewBox="0 0 210 130" aria-hidden>
          <path
            d="M15 65 Q105 -25 195 65 Q105 155 15 65 Z"
            className="fill-white stroke-brand-tealDark dark:fill-slate-200 dark:stroke-brand-teal"
            strokeWidth="6"
          />
          <circle cx="105" cy="65" r="32" className="fill-brand-tealDark dark:fill-brand-teal" />
          <circle cx="105" cy="65" r="14" fill="#000" />
          <circle cx="115" cy="54" r="6" fill="#fff" />
        </svg>
      </motion.div>
      <div className="text-center">
        <AnimatePresence mode="wait">
          {parpadeando ? (
            <motion.div key="blink" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-2xl font-bold tabular-nums">Parpadeo {rep} / 10</p>
              <p className="text-sm text-black/60 dark:text-slate-400">
                Ronda {ronda} · cierra 2 s y abre con el ojo
              </p>
            </motion.div>
          ) : (
            <motion.div key="rest" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-2xl font-bold text-brand-orangeDark dark:text-brand-orange">
                Descansa… {descansoRestante} s
              </p>
              <p className="text-sm text-black/60 dark:text-slate-400">
                Mantén los ojos abiertos y relajados
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- 2. Regla 20-20-20 (anillo + estado "mira a lo lejos") ---------- */
export function Regla202020Anim() {
  const [restante, setRestante] = useState(20);
  const [ronda, setRonda] = useState(1);

  useEffect(() => {
    const iv = window.setInterval(() => {
      setRestante((r) => {
        if (r <= 1) {
          setRonda((x) => x + 1);
          return 20;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(iv);
  }, []);

  const C = 2 * Math.PI * 44;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ minHeight: 280 }}>
      {/* Escena atenuada de horizonte lejano: la pantalla "se apaga" para invitar a mirar a 6 m */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1B2A4A] via-[#27436B] to-[#101C33]" />
      <svg
        className="absolute inset-x-0 bottom-0 h-2/3 w-full"
        viewBox="0 0 400 160"
        preserveAspectRatio="none"
        aria-hidden
      >
        <circle cx="316" cy="52" r="22" fill="#F79A56" opacity="0.9" />
        <circle cx="316" cy="52" r="34" fill="#F79A56" opacity="0.18" />
        <path d="M0 96 L400 88" stroke="#8FB8D8" strokeWidth="2" opacity="0.5" />
        <path d="M0 160 L0 110 Q80 84 170 104 T400 96 L400 160 Z" fill="#0C1830" />
        <path d="M0 160 L0 128 Q120 104 230 122 T400 116 L400 160 Z" fill="#070F20" />
      </svg>

      <div className="relative flex h-full min-h-[280px] flex-col items-center justify-between p-5">
        <div className="relative">
          <svg width="120" height="120" viewBox="0 0 100 100" className="-rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#ffffff26" strokeWidth="8" />
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#F79A56"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: C }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold tabular-nums text-white">
            {restante}
          </div>
        </div>
        <div className="text-center">
          <p className="font-semibold text-white">
            👀 Aparta la vista y mira el horizonte: un objeto a <b>6 metros</b>
          </p>
          <p className="mt-1 text-sm text-white/60">
            La pantalla se atenúa mientras descansas · Ronda {Math.min(ronda, 3)} de 3
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- 3. Ocho horizontal (∞): 30 s → pausa 10 s → 30 s inverso ---------- */
export function OchoAnim() {
  const boxRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const theta = useRef(0);
  const fase = useRef<"ida" | "pausa" | "vuelta">("ida");
  const enFase = useRef(0);
  const [caption, setCaption] = useState<{ f: string; extra: string }>({
    f: "ida",
    extra: "sentido →",
  });

  useAnimationFrame((_, delta) => {
    const box = boxRef.current;
    const dot = dotRef.current;
    if (!box || !dot) return;
    const dt = Math.min(delta, 64) / 1000;
    enFase.current += dt;

    if (fase.current === "ida" && enFase.current >= 30) {
      fase.current = "pausa";
      enFase.current = 0;
      setCaption({ f: "pausa", extra: "" });
    } else if (fase.current === "pausa") {
      if (enFase.current >= 10) {
        fase.current = "vuelta";
        enFase.current = 0;
        setCaption({ f: "vuelta", extra: "sentido ←" });
      }
    } else if (fase.current === "vuelta" && enFase.current >= 30) {
      fase.current = "ida";
      enFase.current = 0;
      setCaption({ f: "ida", extra: "sentido →" });
    }

    // Velocidad angular constante: una vuelta completa al ∞ cada 6 s.
    if (fase.current !== "pausa") {
      const dir = fase.current === "ida" ? 1 : -1;
      theta.current += dir * dt * ((Math.PI * 2) / 6);
    }
    const w = box.clientWidth;
    const h = box.clientHeight;
    const x = w / 2 + w * 0.4 * Math.sin(theta.current);
    const y = h / 2 + h * 0.38 * Math.sin(2 * theta.current);
    dot.style.transform = `translate(${x - 12}px, ${y - 12}px)`;
  });

  const puntos = useMemo(() => {
    const pts: string[] = [];
    for (let t = 0; t <= Math.PI * 2 + 0.001; t += 0.04) {
      const px = 50 + 40 * Math.sin(t);
      const py = 30 + 22.8 * Math.sin(2 * t);
      pts.push(`${px.toFixed(2)},${py.toFixed(2)}`);
    }
    return pts.join(" ");
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        ref={boxRef}
        className="relative h-64 w-full overflow-hidden rounded-2xl bg-brand-bg dark:bg-brand-dark"
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 60"
          preserveAspectRatio="none"
          aria-hidden
        >
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
            animate={caption.f === "pausa" ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={caption.f === "pausa" ? { duration: 2, repeat: Infinity } : { duration: 0.3 }}
          />
        </div>
        {caption.f === "pausa" && (
          <div className="absolute inset-x-0 top-4 text-center">
            <span className="rounded-full bg-brand-orange px-4 py-1.5 text-sm font-bold text-[#0E2A47]">
              Descansa 10 s · cierra los ojos un momento
            </span>
          </div>
        )}
      </div>
      <p className="text-center text-sm font-medium">
        Cabeza quieta: sigue el punto naranja solo con los ojos
        {caption.extra && (
          <>
            {" "}· <b>{caption.extra}</b>
          </>
        )}
      </p>
    </div>
  );
}

/* ---------- 4. Enfoque cercano-lejano (simulación de profundidad) ---------- */
export function EnfoqueAnim() {
  const [fase, setFase] = useState<"cerca" | "lejos">("cerca");
  const [ciclo, setCiclo] = useState(1);
  const primera = useRef(true);

  useEffect(() => {
    const iv = window.setInterval(
      () => setFase((f) => (f === "cerca" ? "lejos" : "cerca")),
      10000
    );
    return () => window.clearInterval(iv);
  }, []);

  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    if (fase === "cerca") setCiclo((c) => Math.min(c + 1, 10));
  }, [fase]);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex h-56 w-full items-center justify-center overflow-hidden rounded-2xl bg-brand-bg dark:bg-brand-dark">
        <motion.div
          animate={{
            width: fase === "cerca" ? 140 : 24,
            height: fase === "cerca" ? 140 : 24,
            filter: fase === "cerca" ? "blur(0px)" : "blur(1.6px)",
            opacity: fase === "cerca" ? 1 : 0.8,
          }}
          transition={{ duration: 2.4, ease: "easeInOut" }}
          style={{
            borderRadius: "50%",
            background: "#F79A56",
            boxShadow:
              "0 0 0 2px rgba(255,255,255,0.55), 0 0 24px rgba(247,154,86,0.8)",
          }}
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={fase}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-center text-lg font-bold"
        >
          {fase === "cerca"
            ? "👆 Enfoca tu dedo (cerca)"
            : "🏔️ Mira un objeto lejano (6 m)"}
        </motion.p>
      </AnimatePresence>
      <p className="text-sm text-black/60 dark:text-slate-400">
        Ciclo {ciclo} / 10 · cambio cada 10 segundos
      </p>
    </div>
  );
}

/* ---------- Marcapasos de respiración compartido (5 y 6) ---------- */
function usePulsoRespiracion(periodoMs = 8000) {
  const [inhala, setInhala] = useState(true);
  useEffect(() => {
    const iv = window.setInterval(() => setInhala((i) => !i), periodoMs / 2);
    return () => window.clearInterval(iv);
  }, [periodoMs]);
  return inhala;
}

/* ---------- 5. Masaje palpebral con calor (pacer + pasos con iconos) ---------- */
export function MasajeAnim() {
  const inhala = usePulsoRespiracion();
  const [t, setT] = useState(0);

  useEffect(() => {
    const iv = window.setInterval(() => setT((x) => x + 1), 1000);
    return () => window.clearInterval(iv);
  }, []);

  const paso = t % 30 < 10 ? 0 : 1;
  const PASOS = [
    { icono: "🤲", texto: "Frota tus manos hasta calentarlas" },
    { icono: "✋", texto: "Palmas sobre los párpados, círculos suaves" },
  ];

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 dark:from-[#2a1c0a] dark:to-[#3a2810]">
        <motion.div
          animate={{ scale: [1, 1.45, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-brand-orange text-4xl shadow-[0_0_40px_rgba(247,154,86,0.6)]"
        >
          {PASOS[paso].icono}
        </motion.div>
      </div>
      <div className="flex w-full flex-col gap-2 sm:flex-row">
        {PASOS.map((p, i) => (
          <div
            key={p.icono}
            className={`flex flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
              paso === i
                ? "border-brand-orangeDark bg-brand-orange/15 font-semibold"
                : "border-brand-accent/10 opacity-55 dark:border-white/10"
            }`}
          >
            <span className="text-xl">{p.icono}</span>
            <span>{p.texto}</span>
          </div>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={inhala ? "in" : "out"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-lg font-bold"
        >
          {inhala ? "Inhala profundo… (el círculo crece)" : "Exhala lentamente… (se contrae)"}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/* ---------- 6. Palming (oscuridad + respiración apenas visible + salida calmada) ---------- */
export function PalmingAnim() {
  const inhala = usePulsoRespiracion();
  const [t, setT] = useState(0);

  useEffect(() => {
    const iv = window.setInterval(() => setT((x) => x + 1), 1000);
    return () => window.clearInterval(iv);
  }, []);

  const saliendo = t >= 54; // últimos segundos: transición de salida calmada

  return (
    <motion.div
      initial={{ backgroundColor: "rgba(3,6,12,0)" }}
      animate={{
        backgroundColor: saliendo ? "rgba(16,30,52,0.55)" : "rgba(3,6,12,0.97)",
      }}
      transition={{ duration: saliendo ? 4 : 3, ease: "easeInOut" }}
      className="flex w-full flex-col items-center gap-6 rounded-2xl px-4 py-10"
    >
      <motion.div
        animate={{ scale: [1, 1.6, 1], opacity: saliendo ? [0.4, 0.6, 0.4] : [0.18, 0.4, 0.18] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="h-28 w-28 rounded-full bg-[#123657] shadow-[0_0_60px_rgba(30,84,134,0.55)]"
      />
      <AnimatePresence mode="wait">
        <motion.p
          key={saliendo ? "salida" : inhala ? "in" : "out"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-lg font-bold text-slate-300"
        >
          {saliendo
            ? "Retira las manos lentamente y abre los ojos…"
            : inhala
              ? "Inhala… el círculo crece"
              : "Exhala… el círculo se encoge"}
        </motion.p>
      </AnimatePresence>
      <p className="max-w-xs text-center text-sm text-slate-500">
        Cubre tus ojos con las palmas: oscuridad total, sin presionar.
      </p>
    </motion.div>
  );
}

/* ---------- 7. Push up pencil (seguimiento horizontal → vertical) ---------- */
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
    // Onda triangular: velocidad constante, ida y vuelta cada 8 s.
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
        Sigue el punto naranja solo con los ojos ·{" "}
        <b>{eje === "x" ? "movimiento horizontal ↔" : "movimiento vertical ↕"}</b>
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
