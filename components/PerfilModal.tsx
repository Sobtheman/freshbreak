"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Usuario, useApp } from "./providers";

export default function PerfilModal({ onClose }: { onClose: () => void }) {
  const { user, setUser, showToast } = useApp();
  const [form, setForm] = useState<Usuario>(
    user ?? { nombre: "", correo: "", edad: "", ocupacion: "", correccion: "No" }
  );

  function guardar(e: FormEvent) {
    e.preventDefault();
    setUser(form);
    showToast("✓ Perfil actualizado");
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.form
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        onSubmit={guardar}
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-md space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="m-0 text-lg font-bold text-brand-accent dark:text-sky-200">
            Editar perfil
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md px-2 text-xl text-black/50 hover:text-black dark:text-slate-400 dark:hover:text-white"
          >
            ×
          </button>
        </div>

        <div>
          <label htmlFor="p-nombre" className="label">Nombre completo</label>
          <input
            id="p-nombre"
            className="field"
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="p-correo" className="label">Correo electrónico</label>
          <input
            id="p-correo"
            type="email"
            className="field"
            required
            value={form.correo}
            onChange={(e) => setForm({ ...form, correo: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="p-edad" className="label">Edad</label>
            <input
              id="p-edad"
              type="number"
              min={10}
              max={99}
              className="field"
              required
              value={form.edad}
              onChange={(e) => setForm({ ...form, edad: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="p-ocup" className="label">Ocupación</label>
            <input
              id="p-ocup"
              className="field"
              required
              value={form.ocupacion}
              onChange={(e) => setForm({ ...form, ocupacion: e.target.value })}
            />
          </div>
        </div>
        <div>
          <span className="label">¿Usa corrección óptica?</span>
          <div className="grid grid-cols-2 gap-3">
            {(["Sí", "No"] as const).map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => setForm({ ...form, correccion: op })}
                aria-pressed={form.correccion === op}
                className={`rounded-xl border px-4 py-2.5 font-semibold transition ${
                  form.correccion === op
                    ? "border-brand-accent bg-brand-accent text-white dark:border-sky-400 dark:bg-sky-400 dark:text-brand-dark"
                    : "border-brand-accent/20 bg-white text-brand-accent dark:border-white/15 dark:bg-brand-dark dark:text-slate-200"
                }`}
              >
                {op}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" className="btn-primary w-full">
          Guardar cambios
        </button>
      </motion.form>
    </motion.div>
  );
}
