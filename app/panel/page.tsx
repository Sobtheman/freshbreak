"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/components/providers";
import { EJERCICIOS, Ejercicio, randomEjercicio } from "@/lib/exercises";
import NotificationModal from "@/components/NotificationModal";
import ComplianceChart from "@/components/ComplianceChart";
import SymptomChart from "@/components/SymptomChart";
import PerfilModal from "@/components/PerfilModal";

const INTERVALOS = [
  { valor: 3600, etiqueta: "60 minutos (recomendado)" },
  { valor: 1200, etiqueta: "20 minutos" },
  { valor: 60, etiqueta: "1 minuto" },
  { valor: 10, etiqueta: "10 segundos (demo)" },
];

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export default function PanelPage() {
  const { user, pauseSeconds, setPauseSeconds } = useApp();
  const [restante, setRestante] = useState(pauseSeconds);
  const [activo, setActivo] = useState(false);
  const [propuesto, setPropuesto] = useState<Ejercicio | null>(null);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activo) return;
    intervalRef.current = window.setInterval(() => {
      setRestante((r) => {
        if (r <= 1) {
          setActivo(false);
          setPropuesto(randomEjercicio());
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [activo]);

  function cambiarIntervalo(v: number) {
    setPauseSeconds(v);
    setActivo(false);
    setRestante(v);
  }

  function cerrarModal() {
    setPropuesto(null);
    setRestante(pauseSeconds);
    setActivo(true); // la jornada continúa y el temporizador se reinicia
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              ¡Hola, <span className="text-brand-tealDark dark:text-brand-teal">{user.nombre.split(" ")[0]}</span>!
              Bienvenida de nuevo. 👋
            </h1>
            <p className="mt-1 text-black/60 dark:text-slate-400">
              Cuidemos tus ojos durante la jornada de estudio de hoy.
            </p>
          </div>
          <button onClick={() => setEditandoPerfil(true)} className="btn-ghost text-sm">
            ⚙️ Editar perfil
          </button>
        </div>
      </motion.div>

      {/* Tarjeta grande del temporizador */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card overflow-hidden bg-gradient-to-br from-brand-tealDeep to-brand-tealDark !text-white dark:from-brand-card dark:to-[#0a4540]"
      >
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
            Próxima pausa en
          </p>
          <motion.p
            key={restante}
            initial={{ scale: 1 }}
            animate={restante <= 5 && activo ? { scale: [1, 1.08, 1] } : {}}
            className={`font-mono text-6xl font-bold tabular-nums sm:text-7xl ${
              restante <= 5 && activo ? "text-brand-orange" : ""
            }`}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {fmt(restante)}
          </motion.p>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <button
              onClick={() => (activo ? setActivo(false) : setActivo(true))}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-7 py-3 font-bold text-[#0E2A47] shadow-lg transition hover:scale-[1.02] hover:bg-brand-orangeDark"
            >
              {activo ? "⏸ Pausar jornada" : "📚 Iniciar jornada de estudio"}
            </button>
            <button
              onClick={() => {
                setActivo(false);
                setRestante(pauseSeconds);
              }}
              className="rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
            >
              ↺ Reiniciar
            </button>
          </div>

          <label className="flex flex-wrap items-center justify-center gap-2 text-sm text-white/80">
            Intervalo entre pausas:
            <select
              value={pauseSeconds}
              onChange={(e) => cambiarIntervalo(Number(e.target.value))}
              className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 font-semibold text-white outline-none backdrop-blur [&>option]:text-black"
            >
              {INTERVALOS.map((i) => (
                <option key={i.valor} value={i.valor}>
                  {i.etiqueta}
                </option>
              ))}
            </select>
          </label>
        </div>
      </motion.section>

      {/* Cuadrícula de ejercicios */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-brand-accent dark:text-sky-200">
          Ejercicios visuales
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EJERCICIOS.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
            >
              <Link
                href={`/ejercicio/${e.id}`}
                className="card group flex h-full flex-col transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-bg text-2xl transition group-hover:scale-110 dark:bg-brand-dark">
                  {e.emoji}
                </div>
                <p className="font-bold">{e.nombre}</p>
                <p className="mt-1 flex-1 text-sm text-black/60 dark:text-slate-400">
                  {e.objetivo}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand-accent dark:text-sky-300">
                  ⏱ {e.duracionLabel}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Widgets de seguimiento (datos simulados) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid gap-4 lg:grid-cols-2"
      >
        <div className="card">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-bold text-brand-accent dark:text-sky-200">
              Cumplimiento semanal
            </h2>
            <p className="text-3xl font-bold">71 %</p>
          </div>
          <p className="mb-4 text-sm text-black/60 dark:text-slate-400">
            Pausas visuales completadas por día (última semana)
          </p>
          <ComplianceChart />
        </div>
        <div className="card">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-bold text-brand-accent dark:text-sky-200">
              Reducción de síntomas
            </h2>
            <p className="text-3xl font-bold text-brand-orangeDark dark:text-brand-orange">−61 %</p>
          </div>
          <p className="mb-4 text-sm text-black/60 dark:text-slate-400">
            Puntaje CVS-Q reportado por semana (menos es mejor)
          </p>
          <SymptomChart />
        </div>
        <div className="card lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-brand-accent dark:text-sky-200">
            Tus ejercicios
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-2xl bg-brand-teal/10 p-4 dark:bg-brand-teal/15">
              <motion.span
                className="text-4xl"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                👁️
              </motion.span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-slate-400">
                  Más realizado
                </p>
                <p className="font-bold">Parpadeo consciente</p>
                <p className="text-sm text-black/60 dark:text-slate-400">23 veces esta semana</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl bg-brand-orange/10 p-4 dark:bg-brand-orange/15">
              <span className="text-4xl">🌑</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-slate-400">
                  Menos realizado
                </p>
                <p className="font-bold">Palming</p>
                <p className="text-sm text-black/60 dark:text-slate-400">4 veces esta semana · ¡dale una oportunidad!</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <AnimatePresence>
        {propuesto && (
          <NotificationModal ejercicio={propuesto} onClose={cerrarModal} />
        )}
        {editandoPerfil && <PerfilModal onClose={() => setEditandoPerfil(false)} />}
      </AnimatePresence>
    </div>
  );
}
