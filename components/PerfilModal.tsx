"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Usuario, useApp } from "./providers";

export default function PerfilModal({ onClose }: { onClose: () => void }) {
  const { user, setUser, showToast, esDemo } = useApp();
  const [form, setForm] = useState<Usuario>(
    user ?? { nombre: "", correo: "", edad: "", ocupacion: "", correccion: "No" }
  );
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (guardando) return;
    // En modo demo no hay cuenta en el servidor: solo se actualiza local.
    if (!esDemo) {
      setGuardando(true);
      try {
        const r = await fetch("/api/perfil", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const d = await r.json().catch(() => ({ ok: false }));
        if (!d.ok && d.code === "correo_en_uso") {
          showToast("Ese correo ya pertenece a otra cuenta");
          setGuardando(false);
          return;
        }
        if (!d.ok) {
          showToast("Aviso: el cambio no se guardó en el servidor");
        }
      } catch {
        showToast("Aviso: el cambio no se guardó en el servidor");
      }
      setGuardando(false);
    }
    setUser(form);
    showToast("Perfil actualizado");
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
          <h2 className="m-0 text-lg font-bold text-brand-accent">
            Editar perfil
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md px-2 text-xl text-black/50 hover:text-ink"
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
                    ? "border-brand-accent bg-brand-accent text-white"
                    : "border-brand-accent/20 bg-white text-brand-accent"
                }`}
              >
                {op}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" disabled={guardando} className="btn-primary w-full">
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
      </motion.form>
    </motion.div>
  );
}
