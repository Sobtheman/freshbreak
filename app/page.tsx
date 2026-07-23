"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { EyeMark } from "@/components/Logo";

const BENEFICIOS = [
  {
    emoji: "📋",
    titulo: "Encuesta CVS-Q",
    texto:
      "Evalúa tus síntomas de fatiga visual digital con el cuestionario CVS-Q y conoce tu resultado al instante.",
  },
  {
    emoji: "⏰",
    titulo: "Recordatorios inteligentes",
    texto:
      "Notificaciones en la app y por correo electrónico cada 60 minutos (configurable) para no saltarte ninguna pausa.",
  },
  {
    emoji: "👁️",
    titulo: "7 ejercicios guiados",
    texto:
      "Guías visuales animadas que tus ojos siguen en tiempo real: parpadeo, regla 20-20-20, ocho horizontal y más.",
  },
  {
    emoji: "📊",
    titulo: "Seguimiento de progreso",
    texto:
      "Panel con tu cumplimiento semanal, la reducción de tus síntomas y tus ejercicios más realizados.",
  },
];

const PASOS = [
  { n: "1", t: "Regístrate", d: "Solo tu nombre, correo y ocupación." },
  { n: "2", t: "Responde la encuesta", d: "El CVS-Q mide tu nivel de fatiga visual." },
  { n: "3", t: "Activa tus pausas", d: "Inicia tu jornada y sigue los ejercicios guiados." },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D5F3EF] via-brand-bg to-white px-6 py-14 text-center shadow-sm dark:from-[#0B3B38] dark:via-brand-dark dark:to-brand-card sm:py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto w-44 sm:w-52"
        >
          <EyeMark className="w-full drop-shadow-lg" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mt-4 text-4xl font-bold tracking-[0.06em] text-[#0E2A47] dark:text-slate-100 sm:text-5xl"
        >
          FRESHBREAK
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.5 }}
          className="mt-1 text-lg font-semibold uppercase tracking-[0.22em] text-brand-tealDark dark:text-brand-teal sm:text-xl"
        >
          Hora de tu pausa visual
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mx-auto mt-5 max-w-xl text-black/70 dark:text-slate-300"
        >
          FreshBreak promueve pausas activas visuales para prevenir la fatiga
          visual digital en estudiantes universitarios: ejercicios guiados con
          animaciones, recordatorios programados y seguimiento de tu progreso.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52, duration: 0.5 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link href="/registro" className="btn-cta">
            Comenzar →
          </Link>
          <Link href="/panel" className="btn-ghost">
            Ya tengo cuenta · Mi panel
          </Link>
        </motion.div>
      </section>

      {/* Beneficios */}
      <section className="mt-12">
        <h2 className="mb-5 text-center text-2xl font-bold text-brand-accent dark:text-sky-200">
          ¿Qué hace FreshBreak por tus ojos?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {BENEFICIOS.map((b, i) => (
            <motion.div
              key={b.titulo}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06 }}
              className="card"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-teal/20 to-brand-teal/5 text-2xl dark:from-brand-teal/25 dark:to-transparent">
                {b.emoji}
              </div>
              <p className="font-bold">{b.titulo}</p>
              <p className="mt-1 text-sm text-black/60 dark:text-slate-400">
                {b.texto}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mt-12">
        <h2 className="mb-5 text-center text-2xl font-bold text-brand-accent dark:text-sky-200">
          ¿Cómo funciona?
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PASOS.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1 }}
              className="card text-center"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-orange text-lg font-bold text-[#0E2A47]">
                {p.n}
              </div>
              <p className="font-bold">{p.t}</p>
              <p className="mt-1 text-sm text-black/60 dark:text-slate-400">{p.d}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/registro" className="btn-cta">
            Comenzar ahora →
          </Link>
          <p className="mt-4 text-xs text-black/50 dark:text-slate-400">
            Demo académica · Sin base de datos, todos los datos viven en tu navegador.
          </p>
        </div>
      </section>
    </div>
  );
}
