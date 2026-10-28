"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { PREGUNTAS, Respuesta } from "@/lib/cvsq";
import { SUS_EXTREMOS, SUS_INSTRUCCION, SUS_ITEMS } from "@/lib/sus";
import { DIAS_INTERVENCION } from "@/lib/estudio";
import CvsqPreguntas from "@/components/CvsqPreguntas";

type Estado = {
  nombre: string;
  cvsqInicial: number | null;
  dias: number;
  disponible: boolean;
  completado: boolean;
  diasRestantes: number;
};

type Fase =
  | { tipo: "cargando" }
  | { tipo: "sin_identificar" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "listo"; estado: Estado }
  | { tipo: "enviado"; cvsqInicial: number | null; cvsqFinal: number };

function Aviso({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="card mx-auto max-w-lg py-10 text-center">
      <h1 className="text-2xl font-bold text-ink">{titulo}</h1>
      <div className="mt-3 text-ink/70">{children}</div>
    </div>
  );
}

function Progreso({ hechas, total, etiqueta }: { hechas: number; total: number; etiqueta: string }) {
  return (
    <div className="sticky top-16 z-30 -mx-4 mb-6 bg-mist-bg/90 px-4 py-3 backdrop-blur dark:bg-marine-bg/90">
      <div className="mb-1.5 flex justify-between text-xs font-semibold text-ink dark:text-mist-tint">
        <span>
          {etiqueta} · {hechas} de {total}
        </span>
        <span>{Math.round((hechas / total) * 100)} %</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink/15 dark:bg-white/15">
        <motion.div
          className="h-full rounded-full bg-brand-teal"
          animate={{ width: `${(hechas / total) * 100}%` }}
          transition={{ ease: "easeOut", duration: 0.35 }}
        />
      </div>
    </div>
  );
}

function CierreContenido() {
  const params = useSearchParams();
  const token = params.get("u");
  const [fase, setFase] = useState<Fase>({ tipo: "cargando" });
  const [paso, setPaso] = useState<1 | 2>(1);
  const [cvsq, setCvsq] = useState<Respuesta[]>(() =>
    PREGUNTAS.map(() => ({ frecuencia: null, intensidad: 1 }))
  );
  const [sus, setSus] = useState<(number | null)[]>(() => SUS_ITEMS.map(() => null));
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  useEffect(() => {
    const q = token ? `?u=${encodeURIComponent(token)}` : "";
    fetch(`/api/cierre${q}`)
      .then(async (r) => {
        const d = await r.json();
        if (r.status === 401) return setFase({ tipo: "sin_identificar" });
        if (!d.ok) return setFase({ tipo: "error", mensaje: d.error ?? "Error" });
        setFase({ tipo: "listo", estado: d });
      })
      .catch(() => setFase({ tipo: "error", mensaje: "No se pudo cargar la evaluación" }));
  }, [token]);

  const cvsqHechas = cvsq.filter((r) => r.frecuencia !== null).length;
  const susHechas = sus.filter((v) => v !== null).length;

  function irA(p: 1 | 2) {
    setPaso(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function enviar() {
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const r = await fetch("/api/cierre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ u: token ?? undefined, cvsq, sus }),
      });
      const d = await r.json();
      if (d.ok) {
        setFase({ tipo: "enviado", cvsqInicial: d.cvsqInicial, cvsqFinal: d.cvsqFinal });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (d.error === "ya_respondida" && fase.tipo === "listo") {
        setFase({ tipo: "listo", estado: { ...fase.estado, completado: true } });
      } else {
        setErrorEnvio("No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.");
      }
    } catch {
      setErrorEnvio("No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (fase.tipo === "cargando") {
    return <p className="page-muted text-center">Cargando tu evaluación…</p>;
  }
  if (fase.tipo === "sin_identificar") {
    return (
      <Aviso titulo="Evaluación final">
        <p>
          Abre esta página desde el enlace del correo de cierre que te
          enviamos, o inicia sesión para responderla.
        </p>
        <Link href="/entrar" className="btn-primary mt-6 inline-flex">
          Iniciar sesión
        </Link>
      </Aviso>
    );
  }
  if (fase.tipo === "error") {
    return (
      <Aviso titulo="Algo salió mal">
        <p>{fase.mensaje}</p>
      </Aviso>
    );
  }
  if (fase.tipo === "enviado") {
    const { cvsqInicial, cvsqFinal } = fase;
    return (
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <Aviso titulo="¡Gracias! Tu evaluación quedó registrada">
          <p>
            Con tus respuestas el equipo puede medir si los síntomas cambiaron
            mientras usaste FreshBreak y qué tan útil te resultó la aplicación.
          </p>
          {cvsqInicial !== null && (
            <div className="mx-auto mt-6 grid max-w-xs grid-cols-2 gap-3">
              <div className="rounded-2xl bg-mist-tint p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                  CVS-Q inicial
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-ink">{cvsqInicial}</p>
              </div>
              <div className="rounded-2xl bg-mist-tint p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                  CVS-Q final
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-brand-tealDark">
                  {cvsqFinal}
                </p>
              </div>
            </div>
          )}
          <p className="mt-6 text-sm text-ink/55">
            Puedes seguir usando FreshBreak: tus recordatorios continúan activos.
          </p>
        </Aviso>
      </motion.div>
    );
  }

  const { estado } = fase;
  if (estado.completado) {
    return (
      <Aviso titulo="Ya respondiste tu evaluación final">
        <p>¡Gracias por participar! Solo se registra una evaluación por persona.</p>
      </Aviso>
    );
  }
  if (!estado.disponible) {
    return (
      <Aviso titulo="Tu evaluación final aún no está abierta">
        <p>
          Se abre al terminar las seis semanas de uso ({DIAS_INTERVENCION} días).
          Llevas {estado.dias} {estado.dias === 1 ? "día" : "días"}; te faltan{" "}
          {estado.diasRestantes}. Te avisaremos por correo.
        </p>
      </Aviso>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-mist-tint/50">
          Evaluación final · paso {paso} de 2
        </p>
        <h1 className="mt-1 text-2xl font-bold text-ink dark:text-white sm:text-3xl">
          {paso === 1 ? "¿Cómo están tus ojos hoy?" : "¿Qué tal te pareció la aplicación?"}
        </h1>
        <p className="mt-2 text-ink/70 dark:text-mist-tint/70">
          {paso === 1
            ? `Hola, ${estado.nombre}. ${
                estado.dias >= DIAS_INTERVENCION
                  ? "Terminaste las seis semanas."
                  : "El equipo está cerrando el estudio."
              } Responde de nuevo el cuestionario de síntomas, igual que al empezar, para comparar.`
            : SUS_INSTRUCCION}
        </p>
      </motion.div>

      {paso === 1 ? (
        <>
          <Progreso hechas={cvsqHechas} total={PREGUNTAS.length} etiqueta="Síntomas" />
          <CvsqPreguntas
            respuestas={cvsq}
            setFrecuencia={(i, f) =>
              setCvsq((rs) => rs.map((r, k) => (k === i ? { ...r, frecuencia: f } : r)))
            }
            setIntensidad={(i, s) =>
              setCvsq((rs) => rs.map((r, k) => (k === i ? { ...r, intensidad: s } : r)))
            }
          />
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => irA(2)}
              disabled={cvsqHechas < PREGUNTAS.length}
              className="btn-primary btn-primary-fondo w-full text-base sm:w-auto sm:px-12"
            >
              Siguiente: evaluar la aplicación →
            </button>
          </div>
        </>
      ) : (
        <>
          <Progreso hechas={susHechas} total={SUS_ITEMS.length} etiqueta="Aplicación" />
          <div className="space-y-4">
            {SUS_ITEMS.map((texto, i) => (
              <div key={i} className="card">
                <p className="mb-4 font-semibold">
                  <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-tealDark/15 text-sm font-bold text-brand-tealDark">
                    {i + 1}
                  </span>
                  {texto}
                </p>
                <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={texto}>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={sus[i] === v}
                      onClick={() => setSus((s) => s.map((x, k) => (k === i ? v : x)))}
                      className={`rounded-xl border py-3 text-base font-bold tabular-nums transition ${
                        sus[i] === v
                          ? "border-ink bg-ink text-white"
                          : "border-ink/15 bg-mist-bg text-ink/80 hover:border-ink/40"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-xs text-ink/50">
                  <span>{SUS_EXTREMOS[0]}</span>
                  <span>{SUS_EXTREMOS[1]}</span>
                </div>
              </div>
            ))}
          </div>
          {errorEnvio && (
            <p className="mt-6 text-center text-sm font-semibold text-[#B4421B]">{errorEnvio}</p>
          )}
          <div className="mt-8 flex flex-col-reverse items-center justify-center gap-3 sm:flex-row">
            <button onClick={() => irA(1)} className="btn-ghost-page text-sm">
              ← Volver a los síntomas
            </button>
            <button
              onClick={enviar}
              disabled={susHechas < SUS_ITEMS.length || enviando}
              className="btn-primary btn-primary-fondo w-full text-base sm:w-auto sm:px-12"
            >
              {enviando ? "Guardando…" : "Enviar mi evaluación"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function CierrePage() {
  return (
    <Suspense>
      <CierreContenido />
    </Suspense>
  );
}
