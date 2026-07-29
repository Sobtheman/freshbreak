"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  FRECUENCIAS,
  INTENSIDADES,
  PREGUNTAS,
  PUNTAJE_MAXIMO,
  Respuesta,
  UMBRAL,
  calcularPuntaje,
} from "@/lib/cvsq";
import { useApp } from "@/components/providers";
import Gauge from "@/components/Gauge";

// El mini CVS-Q de la landing precarga estas preguntas (índice → respuesta)
const MAPA_TEASER: [number, number][] = [
  [0, 0],
  [1, 1],
  [3, 2],
];

export default function EncuestaPage() {
  const router = useRouter();
  const { user, setScore, teaser, cargando, onboarded, esDemo } = useApp();
  const [respuestas, setRespuestas] = useState<Respuesta[]>(() =>
    PREGUNTAS.map((_, i) => {
      const slot = MAPA_TEASER.find(([qi]) => qi === i);
      return {
        frecuencia: slot ? teaser[slot[1]] : null,
        intensidad: 1,
      };
    })
  );
  const [enviada, setEnviada] = useState(false);
  const precargadas = teaser.filter((t) => t !== null).length;

  useEffect(() => {
    if (!cargando && !user) router.replace("/");
  }, [cargando, user, router]);

  const contestadas = respuestas.filter((r) => r.frecuencia !== null).length;
  const puntaje = useMemo(() => calcularPuntaje(respuestas), [respuestas]);
  const tieneSintomas = puntaje >= UMBRAL;

  if (!user) return null;


  function setFrecuencia(i: number, f: 0 | 1 | 2) {
    setRespuestas((rs) =>
      rs.map((r, idx) => (idx === i ? { ...r, frecuencia: f } : r))
    );
  }

  function setIntensidad(i: number, s: 1 | 2) {
    setRespuestas((rs) =>
      rs.map((r, idx) => (idx === i ? { ...r, intensidad: s } : r))
    );
  }

  function autollenar() {
    setRespuestas(
      PREGUNTAS.map((_, i) => ({
        frecuencia: ([0, 1, 2] as const)[(i * 7 + 3) % 3],
        intensidad: i % 3 === 0 ? 2 : 1,
      }))
    );
  }

  function enviar() {
    setScore(puntaje);
    setEnviada(true);
    // Guarda la medición en el historial del servidor (el CVS-Q se puede
    // repetir en el tiempo para ver la evolución de los síntomas).
    fetch("/api/cvsq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ puntaje, respuestas }),
    }).catch(() => {});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (enviada) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-xl text-center"
      >
        <div className="card py-10">
          <h1 className="mb-6 text-2xl font-bold text-ink">
            Resultado del cuestionario CVS-Q
          </h1>
          <Gauge score={puntaje} visualMax={16} danger={tieneSintomas} />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mx-auto mt-8 max-w-md text-lg font-semibold"
          >
            {tieneSintomas ? (
              <>
                Presentas síntomas de fatiga visual digital — este aplicativo
                te ayudará a reducirlos con pausas y ejercicios guiados.
              </>
            ) : (
              <>
                Bienvenido/a, {user.nombre.split(" ")[0]}: tu nivel de fatiga
                visual es bajo. ¡Sigamos cuidando tus ojos!
              </>
            )}
          </motion.p>
          <p className="mt-3 text-sm text-ink/50">
            Puntaje: {puntaje} de {PUNTAJE_MAXIMO} · Umbral de síntomas: {UMBRAL}
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="mt-8"
          >
            <Link href={onboarded ? "/panel" : "/horario"} className="btn-primary">
              {onboarded ? "Volver a mi panel →" : "Continuar: mi horario →"}
            </Link>
            <p className="mt-3 text-xs text-ink/50">
              {onboarded
                ? "Esta medición queda en tu historial de evolución."
                : "Último paso: registra tus bloques de estudio para programar tus pausas."}
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-mist-tint/50">
          Paso 2 de 3
        </p>
        <h1 className="mt-1 text-2xl font-bold text-ink dark:text-white sm:text-3xl">
          Cuestionario CVS-Q
        </h1>
        <p className="mt-2 text-ink/70 dark:text-mist-tint/70">
          Responde las 16 preguntas del cuestionario. Cuando un síntoma se
          presenta, indica también su intensidad.
        </p>
        {esDemo && (
          <button onClick={autollenar} className="btn-ghost-page mt-4 text-sm">
            Rellenar con ejemplo (demo)
          </button>
        )}
        {precargadas > 0 && (
          <p className="mt-3 text-xs font-semibold text-brand-tealDark dark:text-marine-line">
            {precargadas} respuesta{precargadas > 1 ? "s" : ""} precargada
            {precargadas > 1 ? "s" : ""} de tu avance en la página de inicio
          </p>
        )}
      </motion.div>

      {/* Barra de progreso pegajosa */}
      <div className="sticky top-16 z-30 -mx-4 mb-6 bg-mist-bg/90 px-4 py-3 backdrop-blur dark:bg-marine-bg/90">
        <div className="mb-1.5 flex justify-between text-xs font-semibold text-ink dark:text-mist-tint">
          <span>{contestadas} de {PREGUNTAS.length} respondidas</span>
          <span>{Math.round((contestadas / PREGUNTAS.length) * 100)} %</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-ink/15 dark:bg-white/15">
          <motion.div
            className="h-full rounded-full bg-brand-teal"
            animate={{ width: `${(contestadas / PREGUNTAS.length) * 100}%` }}
            transition={{ ease: "easeOut", duration: 0.35 }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {PREGUNTAS.map((p, i) => {
          const r = respuestas[i];
          return (
            <motion.div
              key={p.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              className="card"
            >
              <p className="mb-3 font-semibold">
                <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-tealDark/15 text-sm font-bold text-brand-tealDark">
                  {p.num}
                </span>
                {p.texto}
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {FRECUENCIAS.map((f, fi) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrecuencia(i, fi as 0 | 1 | 2)}
                    aria-pressed={r.frecuencia === fi}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                      r.frecuencia === fi
                        ? "border-ink bg-ink text-white"
                        : "border-ink/15 bg-mist-bg text-ink/80 hover:border-ink/40"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {p.intensidad && !!r.frecuencia && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 border-t border-ink/10 pt-3">
                      <p className="mb-2 text-sm font-semibold">
                        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-orange/20 text-xs font-bold text-[#C05E14]">
                          {p.intensidad.num}
                        </span>
                        {p.intensidad.texto}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {INTENSIDADES.map((s, si) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setIntensidad(i, (si + 1) as 1 | 2)}
                            aria-pressed={r.intensidad === si + 1}
                            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                              r.intensidad === si + 1
                                ? "border-brand-orangeDark bg-brand-orange text-[#0E2A47]"
                                : "border-brand-accent/15 bg-white text-black/80 hover:border-brand-orange/60"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={enviar}
          disabled={contestadas < PREGUNTAS.length}
          className="btn-primary w-full text-base sm:w-auto sm:px-12"
        >
          Ver mi resultado
        </button>
      </div>
    </div>
  );
}
