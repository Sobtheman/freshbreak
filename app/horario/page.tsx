"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/components/providers";
import { IconCampana } from "@/components/icons";
import {
  BLOQUES_EJEMPLO,
  Bloque,
  DIAS,
  hora12,
  horaEntera12,
  hoyIndice,
  pausasDelDia,
  razonIntervalo,
  recomendarIntervalo,
} from "@/lib/schedule";

const HORAS = Array.from({ length: 17 }, (_, i) => i + 6); // 6:00 – 22:00

export default function HorarioPage() {
  const router = useRouter();
  const {
    user,
    score,
    bloques,
    setBloques,
    horasPantalla,
    setHorasPantalla,
    setIntervaloMin,
    setOnboarded,
    iniciarJornada,
    showToast,
    teaserDias,
    cargando,
    esDemo,
  } = useApp();
  // Los días marcados en la página de inicio precargan bloques de 8 a 12
  const [lista, setLista] = useState<Bloque[]>(() =>
    bloques.length
      ? bloques
      : [...teaserDias].sort().map((d) => ({ dia: d, inicio: 8, fin: 12 }))
  );
  const [confirmado, setConfirmado] = useState(false);

  useEffect(() => {
    if (!cargando && !user) router.replace("/");
  }, [cargando, user, router]);
  if (!user) return null;

  const recomendado = recomendarIntervalo(score, horasPantalla);
  const pausasHoy = pausasDelDia(lista, hoyIndice(), recomendado);

  function agregarBloque() {
    setLista((l) => [...l, { dia: 0, inicio: 8, fin: 10 }]);
  }
  function actualizar(i: number, campo: keyof Bloque, valor: number) {
    setLista((l) =>
      l.map((b, idx) => {
        if (idx !== i) return b;
        const nuevo = { ...b, [campo]: valor };
        if (nuevo.fin <= nuevo.inicio) nuevo.fin = nuevo.inicio + 1;
        return nuevo;
      })
    );
  }
  function quitar(i: number) {
    setLista((l) => l.filter((_, idx) => idx !== i));
  }

  function activar() {
    setBloques(lista);
    setIntervaloMin(recomendado);
    setOnboarded(true);
    iniciarJornada(recomendado * 60);
    // Guarda el horario en el servidor: desde aquí el cron envía los
    // recordatorios por correo aunque la pestaña esté cerrada.
    fetch("/api/horario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bloques: lista,
        horasPantalla,
        intervaloMin: recomendado,
      }),
    }).catch(() => {});
    showToast("Recordatorios activados según tu horario");
    router.push("/panel");
  }

  if (confirmado) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-xl"
      >
        <div className="card text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-tealDark/15 text-brand-tealDark">
            <IconCampana className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-ink">
            Tu plan de pausas personalizado
          </h1>
          <p className="mt-4 text-ink/70">
            Según tu puntaje CVS-Q ({score ?? 0} puntos), tus {horasPantalla} h
            diarias de pantalla y tu horario, te recomendamos:
          </p>
          <p className="mt-4 text-5xl font-bold text-brand-tealDark">
            cada {recomendado} min
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
            {razonIntervalo(score, horasPantalla)}
          </p>
          {pausasHoy.length > 0 ? (
            <div className="mt-6 rounded-2xl bg-mist-tint p-4 text-sm">
              <p className="font-semibold text-ink">
                Recordatorios programados para hoy ({DIAS[hoyIndice()]}):
              </p>
              <p className="mt-2 font-mono text-ink/70">
                {pausasHoy.map(hora12).join(" · ")}
              </p>
              <p className="mt-2 text-xs text-ink/50">
                Cada uno llega como notificación en la app y correo a {user.correo}
              </p>
            </div>
          ) : (
            <p className="mt-6 text-sm text-ink/60">
              Hoy no tienes bloques de estudio registrados: puedes iniciar una
              jornada libre desde tu panel cuando estudies.
            </p>
          )}
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={activar} className="btn-primary">
              Activar recordatorios →
            </button>
            <button onClick={() => setConfirmado(false)} className="btn-ghost">
              ← Ajustar horario
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-mist-tint/50">
          Paso 3 de 3
        </p>
        <h1 className="mt-1 text-2xl font-bold text-ink dark:text-white sm:text-3xl">
          Tu horario académico
        </h1>
        <p className="mt-2 max-w-xl text-ink/70 dark:text-mist-tint/70">
          FreshBreak programa tus recordatorios <b>dentro de tus bloques de
          estudio</b> — nunca a mitad de la noche ni fuera de clase. Registra
          tus bloques y cuántas horas pasas frente a pantallas.
        </p>
      </motion.div>

      <div className="card mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 text-lg font-bold text-ink">
            Bloques de estudio
          </h2>
          {esDemo && (
            <button
              onClick={() => setLista(BLOQUES_EJEMPLO)}
              className="btn-ghost px-4 py-2 text-xs"
            >
              Cargar ejemplo
            </button>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <AnimatePresence initial={false}>
            {lista.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-2 rounded-xl bg-mist-tint p-3">
                  <select
                    value={b.dia}
                    onChange={(e) => actualizar(i, "dia", Number(e.target.value))}
                    className="field w-auto flex-1 px-3 py-2 text-sm"
                    aria-label="Día"
                  >
                    {DIAS.map((d, di) => (
                      <option key={d} value={di}>{d}</option>
                    ))}
                  </select>
                  <select
                    value={b.inicio}
                    onChange={(e) => actualizar(i, "inicio", Number(e.target.value))}
                    className="field w-auto px-3 py-2 text-sm"
                    aria-label="Hora de inicio"
                  >
                    {HORAS.map((h) => (
                      <option key={h} value={h}>{horaEntera12(h)}</option>
                    ))}
                  </select>
                  <span className="text-sm text-ink/50">a</span>
                  <select
                    value={b.fin}
                    onChange={(e) => actualizar(i, "fin", Number(e.target.value))}
                    className="field w-auto px-3 py-2 text-sm"
                    aria-label="Hora de fin"
                  >
                    {HORAS.filter((h) => h > b.inicio).map((h) => (
                      <option key={h} value={h}>{horaEntera12(h)}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => quitar(i)}
                    aria-label="Quitar bloque"
                    className="ml-auto rounded-lg px-2.5 py-1.5 text-lg text-ink/40 transition hover:bg-ink/5 hover:text-ink"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {lista.length === 0 && (
            <p className="rounded-xl border border-dashed border-ink/25 p-5 text-center text-sm text-ink/50">
              Aún no tienes bloques. Agrega tus horas de clase y estudio, o
              carga el ejemplo.
            </p>
          )}
        </div>
        <button onClick={agregarBloque} className="btn-ghost mt-4 w-full text-sm">
          + Agregar bloque
        </button>
      </div>

      <div className="card mt-4">
        <h2 className="text-lg font-bold text-ink">
          Horas de pantalla al día
        </h2>
        <div className="mt-3 flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={14}
            value={horasPantalla}
            onChange={(e) => setHorasPantalla(Number(e.target.value))}
            className="w-full accent-brand-tealDark"
            aria-label="Horas de pantalla al día"
          />
          <span className="w-16 text-right text-2xl font-bold tabular-nums">
            {horasPantalla} h
          </span>
        </div>
        <p className="mt-2 text-xs text-ink/50">
          La carga visual diaria ajusta la frecuencia recomendada de tus pausas.
        </p>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setConfirmado(true)}
          disabled={lista.length === 0}
          className="btn-primary w-full text-base sm:w-auto sm:px-12"
        >
          Ver mi plan de pausas →
        </button>
      </div>
    </div>
  );
}
