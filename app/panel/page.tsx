"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/components/providers";
import { EJERCICIOS } from "@/lib/exercises";
import { DIAS, hoyIndice } from "@/lib/schedule";
import ComplianceChart from "@/components/ComplianceChart";
import SymptomChart from "@/components/SymptomChart";
import PerfilModal from "@/components/PerfilModal";
import { IconCampana, IconCorreo, IconPerfil, IconReloj } from "@/components/icons";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export default function PanelPage() {
  const router = useRouter();
  const {
    user,
    onboarded,
    score,
    intervaloMin,
    setIntervaloMin,
    jornadaActiva,
    segundosRestantes,
    iniciarJornada,
    detenerJornada,
    dispararPausaAhora,
    completions,
    cumplidasHoy,
    programadasHoy,
  } = useApp();
  const [editandoPerfil, setEditandoPerfil] = useState(false);

  useEffect(() => {
    if (!user || !onboarded) router.replace("/");
  }, [user, onboarded, router]);
  if (!user || !onboarded) return null;

  const ahora = new Date();
  const horaActual = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
  const cumplimientoHoy =
    programadasHoy.length > 0
      ? Math.min(100, Math.round((cumplidasHoy / programadasHoy.length) * 100))
      : cumplidasHoy > 0
        ? 100
        : 0;

  // Más y menos realizados, calculados del registro real de la sesión
  const ordenados = [...EJERCICIOS].sort(
    (a, b) => (completions[b.id] ?? 0) - (completions[a.id] ?? 0)
  );
  const masRealizado = ordenados[0];
  const menosRealizado = ordenados[ordenados.length - 1];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              ¡Hola de nuevo,{" "}
              <span className="text-brand-tealDark dark:text-brand-teal">
                {user.nombre.split(" ")[0]}
              </span>
              ! 👋
            </h1>
            <p className="mt-1 text-black/60 dark:text-slate-400">
              {DIAS[hoyIndice()]} · pausas cada {intervaloMin} min según tu
              horario{score !== null && ` · CVS-Q: ${score} puntos`}
            </p>
          </div>
          <button
            onClick={() => setEditandoPerfil(true)}
            className="btn-ghost gap-2 text-sm"
          >
            <IconPerfil className="h-5 w-5" /> Editar perfil
          </button>
        </div>
      </motion.div>

      {/* Agenda de pausas de hoy */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 lg:grid-cols-5"
      >
        <div className="card !p-0 lg:col-span-3">
          <div className="rounded-t-[17px] bg-gradient-to-br from-brand-tealDeep to-brand-tealDark p-6 text-center text-white dark:from-brand-card dark:to-[#0a4540]">
            <p className="text-xs font-bold uppercase tracking-widest text-white/65">
              {jornadaActiva ? "Próxima pausa en" : "Recordatorios en espera"}
            </p>
            <p className="mt-2 font-mono text-6xl font-bold tabular-nums sm:text-7xl">
              {segundosRestantes !== null ? fmt(segundosRestantes) : "--:--"}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={() => (jornadaActiva ? detenerJornada() : iniciarJornada())}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3 font-bold text-[#0E2A47] shadow-lg transition hover:scale-[1.02] hover:bg-brand-orangeDark"
              >
                {jornadaActiva ? "⏸ Pausar recordatorios" : "📚 Iniciar jornada de estudio"}
              </button>
              <button
                onClick={dispararPausaAhora}
                className="rounded-xl border border-white/40 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                ✉️ Simular llegada del correo
              </button>
            </div>
            <label className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-white/75">
              Intervalo:
              <select
                value={intervaloMin}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setIntervaloMin(v);
                  if (jornadaActiva) iniciarJornada(v * 60);
                }}
                className="rounded-lg border border-white/30 bg-white/10 px-2.5 py-1.5 font-semibold text-white outline-none [&>option]:text-black"
              >
                <option value={60}>60 min</option>
                <option value={30}>30 min</option>
                <option value={20}>20 min</option>
                <option value={1}>1 min (demo)</option>
              </select>
              <span className="opacity-70">· recomendado: según tu CVS-Q</span>
            </label>
          </div>
          <div className="flex items-start gap-3 px-6 py-4 text-sm text-black/60 dark:text-slate-400">
            <span className="mt-0.5 text-brand-tealDark dark:text-brand-teal">
              <IconCorreo className="h-5 w-5" />
            </span>
            <p className="m-0">
              Cada recordatorio llega como <b>notificación en la app</b> y{" "}
              <b>correo a {user.correo}</b> con el ejercicio del momento.
            </p>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="m-0 flex items-center gap-2 text-lg font-bold text-brand-accent dark:text-sky-200">
              <IconCampana className="h-5 w-5" /> Agenda de hoy
            </h2>
            <Link
              href="/horario"
              className="text-xs font-bold text-brand-tealDark underline underline-offset-4 dark:text-brand-teal"
            >
              Editar horario
            </Link>
          </div>
          {programadasHoy.length > 0 ? (
            <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
              {programadasHoy.map((h, i) => {
                const pasada = h <= horaActual;
                const cumplida = pasada && i < cumplidasHoy;
                return (
                  <li
                    key={h}
                    className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold ${
                      cumplida
                        ? "bg-brand-teal/10 text-brand-tealDark dark:text-brand-teal"
                        : pasada
                          ? "bg-black/5 text-black/45 dark:bg-white/5 dark:text-slate-500"
                          : "bg-brand-bg dark:bg-brand-dark"
                    }`}
                  >
                    <span className="font-mono tabular-nums">{h}</span>
                    <span className="text-xs">
                      {cumplida ? "✓ Cumplida" : pasada ? "No realizada" : "Programada"}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-black/55 dark:text-slate-400">
              Hoy no tienes bloques de estudio en tu horario. Usa «Iniciar
              jornada de estudio» para una sesión libre.
            </p>
          )}
        </div>
      </motion.section>

      {/* Seguimiento */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="grid gap-4 lg:grid-cols-2"
      >
        <div className="card">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="m-0 text-lg font-bold text-brand-accent dark:text-sky-200">
              Cumplimiento semanal
            </h2>
            <p className="m-0 text-3xl font-bold tabular-nums">{cumplimientoHoy} %</p>
          </div>
          <p className="mb-3 mt-1 text-sm text-black/60 dark:text-slate-400">
            Hoy: {cumplidasHoy} de {programadasHoy.length || "—"} pausas · la
            barra de hoy se actualiza al completar ejercicios
          </p>
          <ComplianceChart hoyPct={cumplimientoHoy} />
        </div>
        <div className="card">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="m-0 text-lg font-bold text-brand-accent dark:text-sky-200">
              Reducción de síntomas
            </h2>
            <p className="m-0 text-3xl font-bold text-brand-orangeDark dark:text-brand-orange">
              −61 %
            </p>
          </div>
          <p className="mb-3 mt-1 text-sm text-black/60 dark:text-slate-400">
            Puntaje CVS-Q reportado por semana (datos simulados)
          </p>
          <SymptomChart />
        </div>
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-bold text-brand-accent dark:text-sky-200">
            Tus ejercicios
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-2xl bg-brand-teal/10 p-4 dark:bg-brand-teal/15">
              <span className="text-4xl">{masRealizado.emoji}</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-slate-400">
                  Más realizado
                </p>
                <p className="font-bold">{masRealizado.nombre}</p>
                <p className="text-sm text-black/60 dark:text-slate-400">
                  {completions[masRealizado.id] ?? 0} veces
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl bg-brand-orange/10 p-4 dark:bg-brand-orange/15">
              <span className="text-4xl">{menosRealizado.emoji}</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-slate-400">
                  Menos realizado
                </p>
                <p className="font-bold">{menosRealizado.nombre}</p>
                <p className="text-sm text-black/60 dark:text-slate-400">
                  {completions[menosRealizado.id] ?? 0} veces · ¡dale una oportunidad!
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Biblioteca informativa: los ejercicios llegan por las pausas */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
      >
        <div className="flex items-center gap-2">
          <IconReloj className="h-5 w-5 text-brand-tealDark dark:text-brand-teal" />
          <h2 className="m-0 text-xl font-bold text-brand-accent dark:text-sky-200">
            Biblioteca de ejercicios
          </h2>
        </div>
        <p className="mt-1 text-sm text-black/55 dark:text-slate-400">
          Los ejercicios te llegan al azar con cada pausa — esta biblioteca es
          solo para conocerlos de antemano.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EJERCICIOS.map((e) => (
            <Link
              key={e.id}
              href={`/ejercicio/${e.id}`}
              className="card group flex items-center gap-3 !p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-brand-bg text-xl transition group-hover:scale-110 dark:bg-brand-dark">
                {e.emoji}
              </span>
              <span>
                <span className="block text-sm font-bold">{e.nombre}</span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-brand-tealDark dark:text-brand-teal">
                  ⏱ {e.duracionLabel}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </motion.section>

      <AnimatePresence>
        {editandoPerfil && <PerfilModal onClose={() => setEditandoPerfil(false)} />}
      </AnimatePresence>
    </div>
  );
}
