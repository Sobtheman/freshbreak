"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { DIAS_CORTO, horaEntera12 } from "@/lib/schedule";
import { interpretarSUS } from "@/lib/sus";
import { DIAS_INTERVENCION } from "@/lib/estudio";

type Estudiante = {
  id: number;
  nombre: string;
  correo: string;
  creado: string;
  intervalo_min: number;
  horas_pantalla: number;
  recordatorios_activos: boolean;
  bloques: { dia: number; inicio: number; fin: number }[];
  cumplimientos: number;
  cumplimientos_7d: number;
  correos_enviados: number;
  cvsq_inicial: number | null;
  cvsq_actual: number | null;
  mediciones: number;
  cvsq_final: number | null;
  sus: number | null;
  cierre_enviado: string | null;
  dias: number;
};

type Mensaje = {
  id: number;
  nombre: string;
  correo: string;
  mensaje: string;
  creado: string;
};

type Estudio = {
  invitados: number;
  completados: number;
  susMedia: number | null;
  cvsqInicialMedia: number | null;
  cvsqFinalMedia: number | null;
  pares: number;
  pendientesDeInvitar: number;
};

type Datos = {
  totales: { estudiantes: number; activos: number; cumplimientos: number; correos: number };
  estudio: Estudio;
  estudiantes: Estudiante[];
  mensajes: Mensaje[];
};

// Decimales con coma, como en el resto de la aplicación.
const dec = (n: number) => n.toFixed(1).replace(".", ",");

function Stat({ titulo, valor }: { titulo: string; valor: number | string }) {
  const largo = String(valor).length > 6;
  return (
    <div className="card !p-5 text-center">
      <p className={`m-0 whitespace-nowrap font-bold tabular-nums ${largo ? "text-2xl leading-9" : "text-3xl"}`}>
        {valor}
      </p>
      <p className="m-0 mt-1 text-xs font-semibold uppercase tracking-wide text-ink/50">
        {titulo}
      </p>
    </div>
  );
}

function AdminContenido() {
  const params = useSearchParams();
  const clave = params.get("clave") ?? "";
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cerrando, setCerrando] = useState(false);
  const [avisoCierre, setAvisoCierre] = useState<string | null>(null);

  function cargar() {
    fetch(`/api/admin?clave=${encodeURIComponent(clave)}`)
      .then((r) => r.json())
      .then((d) => (d.ok ? setDatos(d) : setError(d.error ?? "Error")))
      .catch(() => setError("No se pudo cargar el resumen"));
  }

  async function cerrarEstudio(pendientes: number) {
    if (
      !window.confirm(
        `Se enviará ahora la invitación a la evaluación final a ${pendientes} ` +
          `estudiante${pendientes === 1 ? "" : "s"}, aunque no hayan cumplido los ` +
          `${DIAS_INTERVENCION} días. No se puede deshacer. ¿Continuar?`
      )
    )
      return;
    setCerrando(true);
    setAvisoCierre(null);
    try {
      const r = await fetch(`/api/admin/cierre?clave=${encodeURIComponent(clave)}`, { method: "POST" });
      const d = await r.json();
      setAvisoCierre(
        d.ok
          ? `Invitaciones enviadas: ${d.enviados} de ${d.pendientes}.`
          : `No se pudo enviar: ${d.error ?? "error"}`
      );
      cargar();
    } catch {
      setAvisoCierre("No se pudo enviar. Revisa la conexión.");
    } finally {
      setCerrando(false);
    }
  }

  useEffect(() => {
    if (!clave) {
      setError("Falta la clave: abre /admin?clave=… con la clave del equipo.");
      return;
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  if (error) {
    return (
      <div className="card mx-auto max-w-md text-center">
        <p className="font-semibold text-ink">{error}</p>
      </div>
    );
  }
  if (!datos) {
    return <p className="page-muted text-center">Cargando resumen…</p>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-mist-tint/50">
          Vista del equipo
        </p>
        <h1 className="mt-1 text-2xl font-bold text-ink dark:text-white sm:text-3xl">
          Estudiantes registrados
        </h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-mist-tint/60">
          Registro de cumplimiento real de todos los estudiantes, según la
          propuesta. Los datos individuales son confidenciales (Ley 1581).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat titulo="Estudiantes" valor={datos.totales.estudiantes} />
        <Stat titulo="Con recordatorios" valor={datos.totales.activos} />
        <Stat titulo="Pausas cumplidas" valor={datos.totales.cumplimientos} />
        <Stat titulo="Correos enviados" valor={datos.totales.correos} />
      </div>

      {/* Resultados del estudio: evaluación final (objetivos 3 y 4) */}
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="m-0 text-lg font-bold text-ink">Evaluación final del estudio</h2>
            <p className="m-0 mt-1 text-sm text-ink/60">
              CVS-Q de cierre y escala SUS. Se envía sola a los {DIAS_INTERVENCION} días
              del registro; con el botón se envía ya a todos.
            </p>
          </div>
          <button
            onClick={() => cerrarEstudio(datos.estudio.pendientesDeInvitar)}
            disabled={cerrando || datos.estudio.pendientesDeInvitar === 0}
            className="btn-primary !px-5 !py-2 text-sm disabled:opacity-50"
          >
            {cerrando
              ? "Enviando…"
              : datos.estudio.pendientesDeInvitar === 0
                ? "Todos invitados"
                : `Enviar evaluación final ya (${datos.estudio.pendientesDeInvitar})`}
          </button>
        </div>
        {avisoCierre && (
          <p className="m-0 mt-3 text-sm font-semibold text-brand-tealDark">{avisoCierre}</p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat titulo="Invitados" valor={datos.estudio.invitados} />
          <Stat titulo="Respondieron" valor={datos.estudio.completados} />
          <Stat
            titulo="SUS promedio"
            valor={datos.estudio.susMedia === null ? "—" : dec(datos.estudio.susMedia)}
          />
          <Stat
            titulo={`CVS-Q inicial → final (n=${datos.estudio.pares})`}
            valor={
              datos.estudio.cvsqInicialMedia === null || datos.estudio.cvsqFinalMedia === null
                ? "—"
                : `${dec(datos.estudio.cvsqInicialMedia)} → ${dec(datos.estudio.cvsqFinalMedia)}`
            }
          />
        </div>
        {datos.estudio.susMedia !== null && (
          <p className="m-0 mt-3 text-xs text-ink/55">
            SUS promedio {dec(datos.estudio.susMedia)} de 100: {interpretarSUS(datos.estudio.susMedia)}.
            Promedios descriptivos; la prueba estadística (t pareada o Wilcoxon) se hace con el CSV.
          </p>
        )}
      </div>

      <div className="card !py-4">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/api/admin/export?tabla=todo&clave=${encodeURIComponent(clave)}`}
            className="btn-primary !px-5 !py-2 text-sm"
          >
            Descargar todos los datos (ZIP)
          </a>
          <span className="text-xs text-ink/50">o por tabla:</span>
          {["usuarios", "bloques", "cvsq", "sus", "cumplimientos", "envios", "mensajes"].map((t) => (
            <a
              key={t}
              href={`/api/admin/export?tabla=${t}&clave=${encodeURIComponent(clave)}`}
              className="rounded-full border border-ink/20 px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-ink/5"
            >
              {t}
            </a>
          ))}
          <span className="text-xs text-ink/50">
            Archivos CSV que abren en Excel, con nombre y correo en cada fila; fechas en hora de Bogotá.
          </span>
        </div>
      </div>

      <div className="card !p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs font-bold uppercase tracking-wide text-ink/50">
                <th className="px-4 py-3">Estudiante</th>
                <th className="px-4 py-3">Registro</th>
                <th className="px-4 py-3">CVS-Q inicial → actual</th>
                <th className="px-4 py-3">Evaluación final</th>
                <th className="px-4 py-3">Intervalo</th>
                <th className="px-4 py-3">Horario</th>
                <th className="px-4 py-3">Cumplidas (7 d)</th>
                <th className="px-4 py-3">Correos</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {datos.estudiantes.map((e) => (
                <tr key={e.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3">
                    <p className="m-0 font-bold text-ink">{e.nombre}</p>
                    <p className="m-0 text-xs text-ink/50">{e.correo}</p>
                  </td>
                  <td className="px-4 py-3 text-xs tabular-nums text-ink/70">
                    {new Date(e.creado).toLocaleString("es-CO", {
                      timeZone: "America/Bogota",
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {e.cvsq_inicial === null ? (
                      <span className="text-ink/40">sin medición</span>
                    ) : (
                      <>
                        {e.cvsq_inicial} → {e.cvsq_actual}
                        <span className="ml-1 text-xs text-ink/50">
                          ({e.mediciones} med.)
                        </span>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {e.sus !== null ? (
                      <>
                        <span className="rounded-full bg-brand-tealDark/10 px-2 py-0.5 font-bold text-brand-tealDark">
                          SUS {dec(e.sus)}
                        </span>
                        {e.cvsq_final !== null && (
                          <p className="m-0 mt-1 tabular-nums text-ink/60">
                            CVS-Q final {e.cvsq_final}
                          </p>
                        )}
                      </>
                    ) : e.cierre_enviado ? (
                      <span className="font-semibold text-[#8A4A16]">Invitado, sin responder</span>
                    ) : (
                      <span className="tabular-nums text-ink/45">
                        Día {e.dias} de {DIAS_INTERVENCION}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{e.intervalo_min} min</td>
                  <td className="px-4 py-3 text-xs tabular-nums">
                    {e.bloques.length === 0 ? (
                      <span className="rounded-full bg-brand-orange/15 px-2 py-0.5 font-bold text-[#8A4A16]">
                        sin horario
                      </span>
                    ) : (
                      <div className="flex max-w-[190px] flex-wrap gap-x-2 gap-y-0.5">
                        {e.bloques.map((b, i) => (
                          <span key={i} className="whitespace-nowrap">
                            <b>{DIAS_CORTO[b.dia]}</b> {horaEntera12(b.inicio)}–{horaEntera12(b.fin)}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {e.cumplimientos_7d}
                    <span className="ml-1 text-xs text-ink/50">
                      de {e.cumplimientos} totales
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{e.correos_enviados}</td>
                  <td className="px-4 py-3">
                    {e.recordatorios_activos ? (
                      <span className="rounded-full bg-brand-tealDark/10 px-2.5 py-1 text-xs font-bold text-brand-tealDark">
                        Activo
                      </span>
                    ) : (
                      <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-bold text-ink/50">
                        De baja
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mensajes del formulario de contacto de la página de inicio */}
      <div className="card">
        <h2 className="m-0 text-lg font-bold text-ink">
          Mensajes recibidos{" "}
          <span className="text-sm font-semibold text-ink/50">
            ({datos.mensajes?.length ?? 0})
          </span>
        </h2>
        {!datos.mensajes || datos.mensajes.length === 0 ? (
          <p className="mt-2 text-sm text-ink/55">
            Aún no hay mensajes del formulario de contacto.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {datos.mensajes.map((m) => (
              <li key={m.id} className="rounded-xl bg-mist-tint p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="m-0 text-sm font-bold text-ink">
                    {m.nombre}{" "}
                    <a
                      href={`mailto:${m.correo}`}
                      className="font-semibold text-brand-tealDark underline underline-offset-2"
                    >
                      {m.correo}
                    </a>
                  </p>
                  <span className="text-xs tabular-nums text-ink/50">
                    {new Date(m.creado).toLocaleString("es-CO", {
                      timeZone: "America/Bogota",
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="m-0 mt-2 whitespace-pre-wrap text-sm text-ink/80">
                  {m.mensaje}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

export default function AdminPage() {
  return (
    <Suspense>
      <AdminContenido />
    </Suspense>
  );
}
