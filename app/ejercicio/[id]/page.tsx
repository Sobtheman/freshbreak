"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getEjercicio } from "@/lib/exercises";
import { useApp } from "@/components/providers";
import { ANIMACIONES } from "@/components/exercise-anims";
import { IconoEjercicio } from "@/components/icons";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export default function EjercicioPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { registrarCumplimiento } = useApp();
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
        <p className="text-lg font-bold">Ejercicio no encontrado</p>
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
    registrarCumplimiento(ejercicio!.id);
    router.push("/panel");
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/panel"
        className="mb-4 inline-block text-sm font-semibold text-brand-tealDark hover:underline dark:text-marine-line"
      >
        ← Volver al panel
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
          <span className="icon-chip !h-11 !w-11">
            <IconoEjercicio id={ejercicio.id} className="h-6 w-6" />
          </span>
          {ejercicio.nombre}
        </h1>
        <p className="mt-2 text-ink/70 dark:text-mist-tint/70">
          <span className="font-semibold text-brand-tealDark dark:text-marine-line">
            Objetivo:
          </span>{" "}
          {ejercicio.objetivo}
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Instrucciones (texto de la propuesta) */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 lg:col-span-2"
        >
          <div className="card">
            <h2 className="mb-3 font-bold text-ink">
              Instrucciones
            </h2>
            <ol className="space-y-3">
              {ejercicio.pasos.map((paso, i) => (
                <li key={paso} className="flex gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{paso}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="card border-l-4 !border-l-brand-teal">
            <h2 className="mb-1 font-bold text-ink">
              ¿Por qué es importante?
            </h2>
            <p className="text-sm text-ink/70">
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
          <div className="card flex flex-col items-center gap-5">
            <div className="flex w-full justify-center py-1">{Anim && <Anim />}</div>
            <p className="w-full rounded-xl bg-brand-tealDark/10 px-4 py-2.5 text-center text-xs font-medium text-brand-tealDeep">
              {ejercicio.guia}
            </p>

            <div className="w-full">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
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
              <div className="h-2.5 overflow-hidden rounded-full bg-ink/15">
                <motion.div
                  className={`h-full rounded-full ${
                    terminado ? "bg-green-500" : "bg-ink"
                  }`}
                  animate={{ width: `${progreso * 100}%` }}
                  transition={{ ease: "linear", duration: 1 }}
                />
              </div>
              <p className="mt-1.5 text-right text-xs text-ink/50">
                Duración total: {ejercicio.duracionLabel}
              </p>
            </div>

            <motion.button
              onClick={completar}
              whileTap={{ scale: 0.97 }}
              animate={terminado ? { scale: [1, 1.04, 1] } : {}}
              transition={terminado ? { duration: 1.2, repeat: Infinity } : undefined}
              className="btn-primary w-full text-base"
            >
              Marcar como cumplido
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
