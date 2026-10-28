"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FRECUENCIAS, INTENSIDADES, PREGUNTAS, Respuesta } from "@/lib/cvsq";

// Las 16 preguntas del CVS-Q con su sub-pregunta de intensidad. Se usa en la
// encuesta inicial y en la evaluación final, para que ambas mediciones se
// respondan exactamente con la misma interfaz.
export default function CvsqPreguntas({
  respuestas,
  setFrecuencia,
  setIntensidad,
}: {
  respuestas: Respuesta[];
  setFrecuencia: (i: number, f: 0 | 1 | 2) => void;
  setIntensidad: (i: number, s: 1 | 2) => void;
}) {
  return (
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
  );
}
