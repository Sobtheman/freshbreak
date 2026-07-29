"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useApp } from "@/components/providers";
import { EyeMark } from "@/components/Logo";

export default function RegistroPage() {
  const router = useRouter();
  const { setUser, showToast } = useApp();
  const [correo, setCorreo] = useState("");
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [ocupacion, setOcupacion] = useState("");
  const [correccion, setCorreccion] = useState<"Sí" | "No">("No");
  const [consiente, setConsiente] = useState(false);
  const [guardando, setGuardando] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!consiente || guardando) return;
    setGuardando(true);
    // Crea la cuenta en el servidor (con sesión); si la base de datos no
    // responde, la demo continúa en modo local y se avisa.
    try {
      const r = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo,
          nombre,
          edad,
          ocupacion,
          correccion,
          consentimiento: true,
        }),
      });
      const d = await r.json().catch(() => ({ ok: false }));
      if (!d.ok && d.code === "cuenta_existente") {
        showToast("Este correo ya tiene una cuenta: entra con tu enlace");
        setGuardando(false);
        router.push("/entrar");
        return;
      }
      if (!d.ok) {
        showToast("Aviso: no se pudo guardar en el servidor; continúas en modo local");
      }
    } catch {
      showToast("Aviso: no se pudo guardar en el servidor; continúas en modo local");
    }
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
        <div className="mx-auto mb-4 w-24">
          <EyeMark className="w-full text-ink" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-ink/50 dark:text-mist-tint/50">
          Paso 1 de 3
        </p>
        <h1 className="mt-1 text-3xl font-bold text-ink dark:text-white">
          Crea tu cuenta en FreshBreak
        </h1>
        <p className="mt-2 text-ink/70 dark:text-mist-tint/70">
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
                    ? "border-ink bg-ink text-white"
                    : "border-ink/20 bg-mist-bg text-ink hover:border-ink/50"
                }`}
              >
                {op}
              </button>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-mist-tint p-4 text-sm text-ink/80">
          <input
            type="checkbox"
            checked={consiente}
            onChange={(e) => setConsiente(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-brand-tealDark"
            required
          />
          <span>
            Autorizo el tratamiento de mis datos personales para programar y
            enviar mis recordatorios de pausas visuales, según la{" "}
            <Link
              href="/privacidad"
              className="font-semibold text-brand-tealDark underline underline-offset-2"
            >
              política de tratamiento de datos
            </Link>{" "}
            (Ley 1581 de 2012).
          </span>
        </label>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={!consiente || guardando}
          className="btn-primary w-full text-base"
        >
          {guardando ? "Creando tu cuenta…" : "Continuar →"}
        </motion.button>
        <p className="text-center text-sm text-ink/60">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/entrar"
            className="font-bold text-brand-tealDark underline underline-offset-4"
          >
            Entra con tu correo
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
