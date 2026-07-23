"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useApp } from "@/components/providers";
import { EyeMark } from "@/components/Logo";

export default function RegistroPage() {
  const router = useRouter();
  const { setUser } = useApp();
  const [correo, setCorreo] = useState("");
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [ocupacion, setOcupacion] = useState("");
  const [correccion, setCorreccion] = useState<"Sí" | "No">("No");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setUser({ correo, nombre, edad, ocupacion, correccion });
    router.push("/encuesta");
  }

  return (
    <div className="mx-auto max-w-xl">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-8 text-center"
      >
        <motion.div
          className="mx-auto mb-3 w-28"
          animate={{ rotate: [0, -3, 3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <EyeMark className="w-full" />
        </motion.div>
        <h1 className="text-3xl font-bold text-brand-accent dark:text-sky-200">
          Crea tu cuenta en FreshBreak
        </h1>
        <p className="mt-2 text-black/70 dark:text-slate-300">
          Tu aliado contra la fatiga visual digital. Regístrate para comenzar.
        </p>
      </motion.div>

      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        className="card space-y-5"
      >
        <div>
          <label htmlFor="correo" className="label">
            Correo electrónico
          </label>
          <input
            id="correo"
            type="email"
            required
            placeholder="tu.correo@universidad.edu.co"
            className="field"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="nombre" className="label">
            Nombre completo
          </label>
          <input
            id="nombre"
            type="text"
            required
            placeholder="María Fernanda Rodríguez"
            className="field"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="edad" className="label">
              Edad
            </label>
            <input
              id="edad"
              type="number"
              required
              min={10}
              max={99}
              placeholder="21"
              className="field"
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="ocupacion" className="label">
              Ocupación
            </label>
            <input
              id="ocupacion"
              type="text"
              required
              placeholder="Estudiante universitario"
              className="field"
              value={ocupacion}
              onChange={(e) => setOcupacion(e.target.value)}
            />
          </div>
        </div>

        <div>
          <span className="label">¿Usa corrección óptica (gafas o lentes de contacto)?</span>
          <div className="grid grid-cols-2 gap-3">
            {(["Sí", "No"] as const).map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => setCorreccion(op)}
                aria-pressed={correccion === op}
                className={`rounded-xl border px-4 py-3 font-semibold transition ${
                  correccion === op
                    ? "border-brand-accent bg-brand-accent text-white dark:border-sky-400 dark:bg-sky-400 dark:text-brand-dark"
                    : "border-brand-accent/20 bg-white text-brand-accent hover:border-brand-accent/50 dark:border-white/15 dark:bg-brand-dark dark:text-slate-200"
                }`}
              >
                {op === "Sí" ? "👓 Sí" : "✨ No"}
              </button>
            ))}
          </div>
        </div>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          className="btn-primary w-full text-base"
        >
          Continuar →
        </motion.button>
        <p className="text-center text-xs text-black/50 dark:text-slate-400">
          Demo académica · Los datos solo viven en tu navegador.
        </p>
      </motion.form>
    </div>
  );
}
