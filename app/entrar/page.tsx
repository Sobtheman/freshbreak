"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { EyeMark } from "@/components/Logo";

function EntrarForm() {
  const params = useSearchParams();
  const expirado = params.get("error") === "expirado";
  const [correo, setCorreo] = useState("");
  const [estado, setEstado] = useState<"inicial" | "enviando" | "enviado" | "error">("inicial");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    try {
      const r = await fetch("/api/auth/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });
      const d = await r.json();
      setEstado(d.ok ? "enviado" : "error");
    } catch {
      setEstado("error");
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="mx-auto mb-4 w-20">
          <EyeMark className="w-full text-ink" />
        </div>
        <h1 className="text-3xl font-bold text-ink dark:text-white">Entrar a FreshBreak</h1>
        <p className="mt-2 text-ink/70 dark:text-mist-tint/70">
          Sin contraseñas: te enviamos un enlace a tu correo y con un clic
          vuelves a tu panel.
        </p>
      </motion.div>

      {estado === "enviado" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center"
        >
          <h2 className="text-xl font-bold text-ink">Revisa tu correo</h2>
          <p className="mt-2 text-sm text-ink/70">
            Si <b>{correo}</b> está registrado, acabamos de enviarle un enlace
            para entrar. Vale por 15 minutos.
          </p>
          <p className="mt-3 text-xs text-ink/50">
            ¿No llega? Mira la carpeta de spam o vuelve a intentarlo.
          </p>
        </motion.div>
      ) : (
        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card space-y-5"
        >
          {expirado && (
            <p className="rounded-xl bg-brand-orange/15 px-4 py-3 text-sm font-semibold text-[#8A4A16]">
              Ese enlace ya venció. Pide uno nuevo aquí.
            </p>
          )}
          <div>
            <label htmlFor="correo" className="label">Correo electrónico</label>
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
          {estado === "error" && (
            <p className="text-sm font-semibold text-[#C05E14]">
              No pudimos enviar el enlace. Inténtalo de nuevo en un momento.
            </p>
          )}
          <button type="submit" disabled={estado === "enviando"} className="btn-primary w-full">
            {estado === "enviando" ? "Enviando…" : "Enviarme el enlace"}
          </button>
          <p className="text-center text-sm text-ink/60">
            ¿Primera vez aquí?{" "}
            <Link href="/registro" className="font-bold text-brand-tealDark underline underline-offset-4">
              Crea tu plan
            </Link>
          </p>
        </motion.form>
      )}
    </div>
  );
}

export default function EntrarPage() {
  return (
    <Suspense>
      <EntrarForm />
    </Suspense>
  );
}
