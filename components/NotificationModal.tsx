"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Ejercicio } from "@/lib/exercises";
import EmailPreview from "./EmailPreview";

export default function NotificationModal({
  ejercicio,
  onClose,
}: {
  ejercicio: Ejercicio;
  onClose: () => void;
}) {
  const [verCorreo, setVerCorreo] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-accent/80 p-4 backdrop-blur-md dark:bg-black/80"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-brand-card"
        >
          <motion.div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-bg text-5xl dark:bg-brand-dark"
            animate={{ rotate: [0, -14, 14, -10, 10, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 1.2 }}
          >
            🔔
          </motion.div>
          <h2 className="text-2xl font-bold text-brand-accent dark:text-sky-200">
            ¡Hora de tu pausa visual!
          </h2>
          <p className="mt-2 text-black/70 dark:text-slate-300">
            Tus ojos llevan un buen rato trabajando. Te proponemos:
          </p>

          <div className="mt-5 rounded-2xl bg-brand-bg p-5 dark:bg-brand-dark">
            <div className="text-4xl">{ejercicio.emoji}</div>
            <p className="mt-1 text-lg font-bold">{ejercicio.nombre}</p>
            <p className="mt-1 text-sm text-black/60 dark:text-slate-400">
              {ejercicio.objetivo}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-brand-accent dark:text-sky-300">
              ⏱ {ejercicio.duracionLabel}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href={`/ejercicio/${ejercicio.id}`}
              className="btn-primary w-full text-base"
            >
              Realizar ejercicio
            </Link>
            <button onClick={onClose} className="btn-ghost w-full text-sm">
              Posponer y seguir estudiando
            </button>
            <button
              onClick={() => setVerCorreo(true)}
              className="mx-auto block text-sm font-semibold text-brand-accent underline underline-offset-4 hover:opacity-75 dark:text-sky-300"
            >
              📧 Vista previa del correo
            </button>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {verCorreo && (
          <EmailPreview ejercicio={ejercicio} onClose={() => setVerCorreo(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
