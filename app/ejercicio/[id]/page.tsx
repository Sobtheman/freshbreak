"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getEjercicio } from "@/lib/exercises";
import { useApp } from "@/components/providers";
import { ANIMACIONES } from "@/components/exercise-anims";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export default function EjercicioPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useApp();
  const ejercicio = getEjercicio(params.id);
  const [restante, setRestante] = useState(ejercicio?.duracion ?? 0);

  useEffect(() => {
    const iv = window.setInterval(
      () => setRestante((r) => (r > 0 ? r - 1 : 0)),
      1000
    );
    return () => window.clearInterval(iv);
  }, []);

  if (!ejercicio) {
    return (
      <div className="card mx-auto max-w-md text-center">
        <p className="text-lg font-bold">Ejercicio no encontrado 😕</p>
        <Link href="/panel" className="btn-primary mt-4">
          Volver al panel
        </Link>
      </div>
    );
  }

  const Anim = ANIMACIONES[ejercicio.id];
  const progreso = 1 - restante / ejercicio.duracion;
  const terminado = restante === 0;

  function completar() {
    showToast("✓ ¡Ejercicio completado! Tus ojos te lo agradecen 🎉");
    router.push("/panel");
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/panel"
        className="mb-4 inline-block text-sm font-semibold text-brand-accent hover:underline dark:text-sky-300"
      >
        ← Volver al panel
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold sm:text-3xl">
          {ejercicio.emoji} {ejercicio.nombre}
        </h1>
        <p className="mt-2 text-black/70 dark:text-slate-300">
          <span className="font-semibold text-brand-accent dark:text-sky-300">
            Objetivo:
          </span>{" "}
          {ejercicio.objetivo}
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Instrucciones */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 lg:col-span-2"
        >
          <div className="card">
            <h2 className="mb-3 font-bold text-brand-accent dark:text-sky-200">
              Paso a paso
            </h2>
            <ol className="space-y-3">
              {ejercicio.pasos.map((paso, i) => (
                <li key={paso} className="flex gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-accent text-xs font-bold text-white dark:bg-sky-400 dark:text-brand-dark">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{paso}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="card border-l-4 !border-l-brand-accent dark:!border-l-sky-400">
            <h2 className="mb-1 font-bold text-brand-accent dark:text-sky-200">
              ¿Por qué es importante?
            </h2>
            <p className="text-sm text-black/70 dark:text-slate-300">
              {ejercicio.porQue}
            </p>
          </div>
        </motion.div>

        {/* Guía animada + temporizador */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-3"
        >
          <div className="card flex flex-col items-center gap-6">
            <div className="flex w-full justify-center py-2">{Anim && <Anim />}</div>

            <div className="w-full">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-slate-400">
                  Tiempo restante
                </span>
                <span
                  className={`font-mono text-2xl font-bold tabular-nums ${
                    terminado ? "text-green-600 dark:text-green-400" : ""
                  }`}
                >
                  {terminado ? "¡Listo!" : fmt(restante)}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-brand-accent/15 dark:bg-white/10">
                <motion.div
                  className={`h-full rounded-full ${
                    terminado
                      ? "bg-green-500"
                      : "bg-brand-accent dark:bg-sky-400"
                  }`}
                  animate={{ width: `${progreso * 100}%` }}
                  transition={{ ease: "linear", duration: 1 }}
                />
              </div>
              <p className="mt-1.5 text-right text-xs text-black/50 dark:text-slate-400">
                Duración total: {ejercicio.duracionLabel}
              </p>
            </div>

            <motion.button
              onClick={completar}
              whileTap={{ scale: 0.97 }}
              animate={terminado ? { scale: [1, 1.04, 1] } : {}}
              transition={
                terminado ? { duration: 1.2, repeat: Infinity } : undefined
              }
              className="btn-primary w-full text-base"
            >
              Marcar como cumplido ✓
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
