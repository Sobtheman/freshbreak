"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function BajaPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md"
    >
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-ink">Recordatorios desactivados</h1>
        <p className="mt-3 text-sm text-ink/70">
          Ya no te enviaremos más correos de pausas. Tus datos y tu historial
          siguen guardados: si cambias de opinión, entra a tu panel y vuelve a
          activar tus recordatorios guardando tu horario de nuevo.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/entrar" className="btn-primary">Entrar a mi panel</Link>
          <Link href="/" className="btn-ghost">Inicio</Link>
        </div>
      </div>
    </motion.div>
  );
}
