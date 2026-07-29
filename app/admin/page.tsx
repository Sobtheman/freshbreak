"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

type Estudiante = {
  id: number;
  nombre: string;
  correo: string;
  creado: string;
  intervalo_min: number;
  horas_pantalla: number;
  recordatorios_activos: boolean;
  bloques: number;
  cumplimientos: number;
  cumplimientos_7d: number;
  correos_enviados: number;
  cvsq_inicial: number | null;
  cvsq_actual: number | null;
  mediciones: number;
};

type Datos = {
  totales: { estudiantes: number; activos: number; cumplimientos: number; correos: number };
  estudiantes: Estudiante[];
};

function Stat({ titulo, valor }: { titulo: string; valor: number | string }) {
  return (
    <div className="card !p-5 text-center">
      <p className="m-0 text-3xl font-bold tabular-nums">{valor}</p>
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

  useEffect(() => {
    if (!clave) {
      setError("Falta la clave: abre /admin?clave=… con la clave del equipo.");
      return;
    }
    fetch(`/api/admin?clave=${encodeURIComponent(clave)}`)
      .then((r) => r.json())
      .then((d) => (d.ok ? setDatos(d) : setError(d.error ?? "Error")))
      .catch(() => setError("No se pudo cargar el resumen"));
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

      <div className="card !p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs font-bold uppercase tracking-wide text-ink/50">
                <th className="px-4 py-3">Estudiante</th>
                <th className="px-4 py-3">Registro</th>
                <th className="px-4 py-3">CVS-Q inicial → actual</th>
                <th className="px-4 py-3">Intervalo</th>
                <th className="px-4 py-3">Bloques</th>
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
                  <td className="px-4 py-3 tabular-nums">{e.intervalo_min} min</td>
                  <td className="px-4 py-3 tabular-nums">{e.bloques}</td>
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
