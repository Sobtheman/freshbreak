"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Ejercicio } from "@/lib/exercises";
import EmailPreview from "./EmailPreview";
import { useApp } from "./providers";

export default function NotificationModal({
  ejercicio,
  onRealizar,
  onPosponer,
}: {
  ejercicio: Ejercicio;
  onRealizar: () => void;
  onPosponer: () => void;
}) {
  const [verCorreo, setVerCorreo] = useState(false);
  const { correoEstado, user } = useApp();
  const hora = new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const lineaCorreo =
    correoEstado === "enviado"
      ? `📧 Correo real enviado a ${user?.correo}`
      : correoEstado === "enviando"
        ? "📧 Enviando el correo a tu bandeja…"
        : correoEstado === "error"
          ? "📧 El correo no pudo enviarse (modo sandbox de Resend: solo entrega al dueño de la cuenta)"
          : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-tealDeep/85 p-4 backdrop-blur-md dark:bg-black/80"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl"
        >
          <motion.div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-bg text-5xl"
            animate={{ rotate: [0, -14, 14, -10, 10, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 1.2 }}
          >
            🔔
          </motion.div>
          <h2 className="text-2xl font-bold text-brand-accent">
            ¡Hora de tu pausa visual!
          </h2>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-black/40">
            Recordatorio de las {hora}
          </p>
          {lineaCorreo && (
            <p
              className={`mx-auto mt-2 max-w-xs text-xs font-semibold ${
                correoEstado === "error" ? "text-[#C05E14]" : "text-brand-tealDark"
              }`}
            >
              {lineaCorreo}
            </p>
          )}
          <p className="mt-2 text-black/70">
            Tu ejercicio de esta pausa, elegido al azar:
          </p>

          <div className="mt-4 rounded-2xl bg-brand-bg p-5">
            <div className="text-4xl">{ejercicio.emoji}</div>
            <p className="mt-1 text-lg font-bold">{ejercicio.nombre}</p>
            <p className="mt-1 text-sm text-black/60">
              {ejercicio.objetivo}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-brand-tealDark">
              ⏱ {ejercicio.duracionLabel}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href={`/ejercicio/${ejercicio.id}`}
              onClick={onRealizar}
              className="btn-primary w-full text-base"
            >
              Realizar ejercicio
            </Link>
            <button onClick={onPosponer} className="btn-ghost w-full text-sm">
              Posponer 5 minutos
            </button>
            <button
              onClick={() => setVerCorreo(true)}
              className="mx-auto block text-sm font-semibold text-brand-accent underline underline-offset-4 hover:opacity-75"
            >
              📧 Vista previa del correo
            </button>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {verCorreo && (
          <EmailPreview
            ejercicio={ejercicio}
            onClose={() => setVerCorreo(false)}
            onIr={onRealizar}
          />
        )}
      </AnimatePresence>
    </>
  );
}
