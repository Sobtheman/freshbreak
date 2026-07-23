"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Ejercicio } from "@/lib/exercises";
import { useApp } from "./providers";

export default function EmailPreview({
  ejercicio,
  onClose,
}: {
  ejercicio: Ejercicio;
  onClose: () => void;
}) {
  const { user } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-brand-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra tipo cliente de correo */}
        <div className="flex items-center gap-2 border-b border-black/10 bg-slate-100 px-4 py-3 dark:border-white/10 dark:bg-brand-dark">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-2 text-xs font-semibold text-black/50 dark:text-slate-400">
            Vista previa del correo (mock)
          </span>
          <button
            onClick={onClose}
            aria-label="Cerrar vista previa"
            className="ml-auto rounded-md px-2 text-lg text-black/50 hover:text-black dark:text-slate-400 dark:hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          <div className="space-y-1 border-b border-black/10 px-5 py-4 text-sm dark:border-white/10">
            <p>
              <span className="font-semibold text-black/50 dark:text-slate-400">De: </span>
              FreshBreak &lt;notificaciones@freshbreak.app&gt;
            </p>
            <p>
              <span className="font-semibold text-black/50 dark:text-slate-400">Para: </span>
              {user.correo}
            </p>
            <p className="pt-1 text-base font-bold">
              Asunto: ¡Hora de tu pausa visual! 👁️
            </p>
          </div>

          <div className="px-5 py-5">
            <div className="rounded-xl bg-brand-bg p-5 dark:bg-brand-dark">
              <p className="text-lg font-bold text-brand-accent dark:text-sky-200">
                ¡Hola, {user.nombre.split(" ")[0]}! 👋
              </p>
              <p className="mt-2 text-sm">
                Llevas un buen rato frente a la pantalla. Es momento de darle un
                respiro a tus ojos con este ejercicio:
              </p>
              <div className="mt-4 rounded-xl bg-white p-4 shadow-sm dark:bg-brand-card">
                <p className="font-bold">
                  {ejercicio.emoji} {ejercicio.nombre}
                </p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-black/75 dark:text-slate-300">
                  {ejercicio.pasos.slice(0, 3).map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ol>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-slate-400">
                  ⏱ Duración: {ejercicio.duracionLabel}
                </p>
              </div>
              <div className="mt-5 text-center">
                <Link
                  href={`/ejercicio/${ejercicio.id}`}
                  onClick={onClose}
                  className="btn-cta text-sm"
                >
                  Realizar ejercicio ahora
                </Link>
              </div>
            </div>
            <p className="mt-4 text-center text-[11px] text-black/40 dark:text-slate-500">
              Recibes este correo porque activaste los recordatorios de
              FreshBreak · Demo académica
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
