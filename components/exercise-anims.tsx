"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
} from "framer-motion";

/* ---------- 1. Parpadeo consciente ---------- */
export function ParpadeoAnim() {
  const [conteo, setConteo] = useState(0);

  useEffect(() => {
    const iv = window.setInterval(() => setConteo((c) => c + 1), 2000);
    return () => window.clearInterval(iv);
  }, []);

  const rep = conteo === 0 ? 0 : ((conteo - 1) % 10) + 1;
  const ronda = conteo === 0 ? 1 : Math.ceil(conteo / 10);

  return (
    <div className="flex flex-col items-center gap-5">
      <motion.div
        animate={{ scaleY: [1, 1, 0.05, 0.05, 1, 1] }}
        transition={{
          duration: 2,
          times: [0, 0.3, 0.42, 0.56, 0.68, 1],
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="origin-center"
      >
        <svg width="210" height="130" viewBox="0 0 210 130" aria-hidden>
          <path
            d="M15 65 Q105 -25 195 65 Q105 155 15 65 Z"
            className="fill-white stroke-brand-accent dark:fill-slate-200 dark:stroke-sky-300"
            strokeWidth="6"
          />
          <circle cx="105" cy="65" r="32" className="fill-brand-accent dark:fill-sky-500" />
          <circle cx="105" cy="65" r="14" fill="#000" />
          <circle cx="115" cy="54" r="6" fill="#fff" />
        </svg>
      </motion.div>
      <div className="text-center">
        <p className="text-2xl font-bold tabular-nums">
          Parpadeo {rep} / 10
        </p>
        <p className="text-sm text-black/60 dark:text-slate-400">
          Ronda {ronda} · cierra y abre al ritmo del ojo
        </p>
      </div>
    </div>
  );
}

/* ---------- 2. Regla 20-20-20 ---------- */
export function Regla202020Anim() {
  const [restante, setRestante] = useState(20);

  useEffect(() => {
    const iv = window.setInterval(
      () => setRestante((r) => (r <= 1 ? 20 : r - 1)),
      1000
    );
    return () => window.clearInterval(iv);
  }, []);

  const C = 2 * Math.PI * 54;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative">
        <svg width="180" height="180" viewBox="0 0 120 120" className="-rotate-90">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.12"
            strokeWidth="9"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={C}
            className="stroke-brand-accent dark:stroke-sky-300"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: C }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-bold tabular-nums">{restante}</span>
        </div>
      </div>
      <p className="max-w-xs text-center font-medium">
        👀 Mira un objeto a <b>6 metros</b> de distancia hasta que el anillo se
        complete
      </p>
    </div>
  );
}

/* ---------- 3. Ocho horizontal (∞) ---------- */
export function OchoAnim() {
  const boxRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const theta = useRef(0);
  const dir = useRef(1);
  const enFase = useRef(0);
  const [sentido, setSentido] = useState<1 | -1>(1);

  useAnimationFrame((_, delta) => {
    const box = boxRef.current;
    const dot = dotRef.current;
    if (!box || !dot) return;
    const dt = Math.min(delta, 64) / 1000;
    enFase.current += dt;
    if (enFase.current >= 30) {
      enFase.current = 0;
      dir.current *= -1;
      setSentido(dir.current as 1 | -1);
    }
    // Una vuelta completa al ∞ cada 6 s, velocidad angular constante.
    theta.current += dir.current * dt * ((Math.PI * 2) / 6);
    const w = box.clientWidth;
    const h = box.clientHeight;
    const x = w / 2 + w * 0.4 * Math.sin(theta.current);
    const y =
      h / 2 + h * 0.38 * Math.sin(theta.current) * Math.cos(theta.current) * 2;
    dot.style.transform = `translate(${x - 10}px, ${y - 10}px)`;
  });

  // Guía tenue del recorrido, mismas proporciones que el punto.
  const puntos = useMemo(() => {
    const pts: string[] = [];
    for (let t = 0; t <= Math.PI * 2 + 0.001; t += 0.04) {
      const px = 50 + 40 * Math.sin(t);
      const py = 30 + 22.8 * Math.sin(t) * Math.cos(t) * 2;
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
        <div
          ref={dotRef}
          className="absolute left-0 top-0 h-5 w-5 rounded-full bg-brand-accent shadow-[0_0_14px_rgba(0,51,102,0.55)] will-change-transform dark:bg-sky-300 dark:shadow-[0_0_14px_rgba(125,211,252,0.7)]"
        />
      </div>
      <p className="text-center text-sm font-medium">
        Cabeza quieta: sigue el punto solo con los ojos ·{" "}
        <b>{sentido === 1 ? "sentido →" : "sentido ←"}</b>
      </p>
    </div>
  );
}

/* ---------- 4. Enfoque cercano-lejano ---------- */
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
          animate={{ width: fase === "cerca" ? 130 : 14, height: fase === "cerca" ? 130 : 14 }}
          transition={{ duration: 2.4, ease: "easeInOut" }}
          className="rounded-full bg-brand-accent shadow-[0_0_20px_rgba(0,51,102,0.4)] dark:bg-sky-300 dark:shadow-[0_0_20px_rgba(125,211,252,0.6)]"
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
            ? "👆 Enfoca tu dedo (visión cercana)"
            : "🏔️ Mira un objeto lejano"}
        </motion.p>
      </AnimatePresence>
      <p className="text-sm text-black/60 dark:text-slate-400">
        Ciclo {ciclo} / 10 · cambio cada 10 segundos
      </p>
    </div>
  );
}

/* ---------- Respiración compartida (5 y 6) ---------- */
function usePulsoRespiracion(periodoMs = 8000) {
  const [inhala, setInhala] = useState(true);
  useEffect(() => {
    const iv = window.setInterval(() => setInhala((i) => !i), periodoMs / 2);
    return () => window.clearInterval(iv);
  }, [periodoMs]);
  return inhala;
}

/* ---------- 5. Masaje palpebral con calor ---------- */
export function MasajeAnim() {
  const inhala = usePulsoRespiracion();

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex h-56 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 dark:from-[#2a1c0a] dark:to-[#3a2810]">
        <motion.div
          animate={{ scale: [1, 1.45, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-4xl shadow-[0_0_40px_rgba(251,146,60,0.55)]"
        >
          🤲
        </motion.div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={inhala ? "in" : "out"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-lg font-bold"
        >
          {inhala ? "Inhala profundo…" : "Exhala lentamente…"}
        </motion.p>
      </AnimatePresence>
      <p className="max-w-xs text-center text-sm text-black/60 dark:text-slate-400">
        Palmas cálidas sobre los párpados, círculos suaves sin presionar.
      </p>
    </div>
  );
}

/* ---------- 6. Palming ---------- */
export function PalmingAnim() {
  const inhala = usePulsoRespiracion();

  return (
    <motion.div
      initial={{ backgroundColor: "rgba(3,6,12,0)" }}
      animate={{ backgroundColor: "rgba(3,6,12,0.97)" }}
      transition={{ duration: 3, ease: "easeInOut" }}
      className="flex w-full flex-col items-center gap-6 rounded-2xl px-4 py-10"
    >
      <motion.div
        animate={{ scale: [1, 1.6, 1], opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="h-28 w-28 rounded-full bg-[#123657] shadow-[0_0_60px_rgba(30,84,134,0.8)]"
      />
      <AnimatePresence mode="wait">
        <motion.p
          key={inhala ? "in" : "out"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-lg font-bold text-slate-300"
        >
          {inhala ? "Inhala… el círculo crece" : "Exhala… el círculo se encoge"}
        </motion.p>
      </AnimatePresence>
      <p className="max-w-xs text-center text-sm text-slate-500">
        Cubre tus ojos con las palmas: oscuridad total, sin presión.
      </p>
    </motion.div>
  );
}

/* ---------- 7. Push up pencil ---------- */
export function PencilAnim() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [eje, setEje] = useState<"x" | "y">("x");
  const [medias, setMedias] = useState({ x: 120, y: 95 });

  useEffect(() => {
    const t = window.setTimeout(() => setEje("y"), 30000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const medir = () =>
      setMedias({
        x: el.clientWidth / 2 - 26,
        y: el.clientHeight / 2 - 26,
      });
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        ref={boxRef}
        className="relative h-64 w-full overflow-hidden rounded-2xl bg-brand-bg dark:bg-brand-dark"
      >
        <motion.div
          key={eje}
          className="absolute left-1/2 top-1/2 -ml-2.5 -mt-2.5 h-5 w-5 rounded-full bg-brand-accent shadow-[0_0_14px_rgba(0,51,102,0.55)] will-change-transform dark:bg-sky-300 dark:shadow-[0_0_14px_rgba(125,211,252,0.7)]"
          animate={
            eje === "x"
              ? { x: [0, -medias.x, medias.x, 0] }
              : { y: [0, -medias.y, medias.y, 0] }
          }
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <p className="text-center text-sm font-medium">
        Sigue el punto solo con los ojos ·{" "}
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
