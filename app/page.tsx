"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useAnimationFrame } from "framer-motion";
import { EyeBadge } from "@/components/Logo";
import {
  IconCalendario,
  IconCampana,
  IconCorreo,
  IconEncuesta,
  IconGrafico,
  IconOjo,
} from "@/components/icons";
import { useApp } from "@/components/providers";

// Demo en vivo: el punto naranja traza el ∞ en el hero — el primer
// ejercicio ocurre antes de hacer scroll.
function DemoOcho() {
  const boxRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const theta = useRef(0);

  useAnimationFrame((_, delta) => {
    const box = boxRef.current;
    const dot = dotRef.current;
    if (!box || !dot) return;
    theta.current += (Math.min(delta, 64) / 1000) * ((Math.PI * 2) / 7);
    const w = box.clientWidth;
    const h = box.clientHeight;
    const x = w / 2 + w * 0.4 * Math.sin(theta.current);
    const y = h / 2 + h * 0.36 * Math.sin(2 * theta.current);
    dot.style.transform = `translate(${x - 12}px, ${y - 12}px)`;
  });

  const puntos = useMemo(() => {
    const pts: string[] = [];
    for (let t = 0; t <= Math.PI * 2 + 0.001; t += 0.04) {
      pts.push(`${(50 + 40 * Math.sin(t)).toFixed(2)},${(30 + 21.6 * Math.sin(2 * t)).toFixed(2)}`);
    }
    return pts.join(" ");
  }, []);

  return (
    <div
      ref={boxRef}
      className="relative h-52 w-full overflow-hidden rounded-2xl bg-white/60 shadow-inner dark:bg-white/5 sm:h-60"
    >
      <svg
        className="absolute inset-0 h-full w-full text-brand-tealDeep dark:text-brand-teal"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        aria-hidden
      >
        <polyline
          points={puntos}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-6 w-6 rounded-full will-change-transform"
        style={{
          background: "#F79A56",
          boxShadow:
            "0 0 0 2px rgba(255,255,255,0.6), 0 0 18px rgba(247,154,86,0.85), 0 0 34px rgba(247,154,86,0.35)",
        }}
      />
      <p className="absolute inset-x-0 bottom-3 text-center text-xs font-semibold text-brand-tealDeep/70 dark:text-slate-300/70">
        Síguelo con la mirada, sin mover la cabeza. Eso es FreshBreak.
      </p>
    </div>
  );
}

const DATOS = [
  {
    Icon: IconOjo,
    dato: "60 % menos",
    texto: "parpadeas frente a una pantalla, y tus ojos se resecan sin que lo notes.",
  },
  {
    Icon: IconCalendario,
    dato: "Tu horario manda",
    texto: "registras tus bloques de estudio y FreshBreak programa las pausas dentro de ellos.",
  },
  {
    Icon: IconCorreo,
    dato: "Te interrumpe a tiempo",
    texto: "recordatorio en la app y en tu correo con un ejercicio aleatorio de 20 s a 3 min.",
  },
];

const PASOS = [
  { Icon: IconEncuesta, t: "Regístrate y responde el CVS-Q", d: "16 preguntas miden tu nivel de fatiga visual digital." },
  { Icon: IconCalendario, t: "Registra tu horario académico", d: "Tus bloques de estudio y horas de pantalla al día." },
  { Icon: IconCampana, t: "Recibe tus pausas programadas", d: "El intervalo se personaliza según tus síntomas (20, 30 o 60 min)." },
  { Icon: IconGrafico, t: "Cumple y mira tu progreso", d: "Cada ejercicio queda en tu historial de cumplimiento." },
];

export default function LandingPage() {
  const router = useRouter();
  const { seedDemo } = useApp();

  return (
    <div>
      {/* Hero: logo real + demo en vivo */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#D5F3EF] via-brand-bg to-white p-6 shadow-sm dark:from-[#0B3B38] dark:via-brand-dark dark:to-brand-card sm:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="mx-auto w-36 sm:w-44 lg:mx-0"
            >
              <EyeBadge className="w-full rounded-[32px] shadow-xl shadow-brand-tealDeep/25" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-5 text-4xl font-bold tracking-[0.07em] text-[#0E2A47] dark:text-slate-100 sm:text-5xl"
            >
              FRESHBREAK
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="mt-1 text-base font-bold uppercase tracking-[0.26em] text-brand-tealDark dark:text-brand-teal sm:text-lg"
            >
              Hora de tu pausa visual
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="mx-auto mt-5 max-w-md text-black/70 dark:text-slate-300 lg:mx-0"
            >
              Estudias horas frente a la pantalla; tus ojos pagan la cuenta.
              FreshBreak programa pausas visuales dentro de tu horario académico
              y te guía, ejercicio por ejercicio, con animaciones que tus ojos
              siguen.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
            >
              <Link href="/registro" className="btn-cta">
                Comenzar →
              </Link>
              <button
                onClick={() => {
                  seedDemo();
                  router.push("/panel");
                }}
                className="btn-ghost"
              >
                ⚡ Ver demo rápida
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.55 }}
          >
            <DemoOcho />
          </motion.div>
        </div>
      </section>

      {/* Historia: el problema y la respuesta */}
      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {DATOS.map(({ Icon, dato, texto }, i) => (
          <motion.div
            key={dato}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.08 }}
            className="card"
          >
            <div className="mb-3 inline-flex rounded-2xl bg-gradient-to-br from-brand-teal/20 to-brand-teal/5 p-3 text-brand-tealDark dark:text-brand-teal">
              <Icon />
            </div>
            <p className="text-lg font-bold">{dato}</p>
            <p className="mt-1 text-sm text-black/60 dark:text-slate-400">{texto}</p>
          </motion.div>
        ))}
      </section>

      {/* Cómo funciona */}
      <section className="mt-14">
        <h2 className="mb-6 text-center text-2xl font-bold text-brand-accent dark:text-sky-200">
          ¿Cómo funciona?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PASOS.map(({ Icon, t, d }, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08 }}
              className="card relative pt-7"
            >
              <span className="absolute -top-4 left-5 flex h-9 w-9 items-center justify-center rounded-full bg-brand-orange text-base font-bold text-[#0E2A47] shadow-md">
                {i + 1}
              </span>
              <div className="mb-2 text-brand-tealDark dark:text-brand-teal">
                <Icon />
              </div>
              <p className="font-bold">{t}</p>
              <p className="mt-1 text-sm text-black/60 dark:text-slate-400">{d}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 text-center">
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
