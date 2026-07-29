"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PrivacidadPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl"
    >
      <div className="card space-y-4">
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">
          Tratamiento de datos personales
        </h1>
        <p className="text-sm text-ink/70">
          FreshBreak trata tus datos conforme a la <b>Ley 1581 de 2012</b> y el{" "}
          <b>Decreto 1377 de 2013</b> de la República de Colombia (régimen de
          protección de datos personales).
        </p>
        <div className="space-y-3 text-sm text-ink/80">
          <p>
            <b>Qué datos guardamos:</b> tu nombre, correo electrónico, edad,
            ocupación, si usas corrección óptica, tus respuestas del
            cuestionario CVS-Q, tu horario de estudio y el registro de pausas
            realizadas.
          </p>
          <p>
            <b>Para qué los usamos:</b> únicamente para programar y enviarte
            los recordatorios de pausas visuales dentro de tu horario, y para
            mostrarte tu propio seguimiento (cumplimiento y evolución de
            síntomas). No compartimos tus datos con terceros ni los usamos con
            fines comerciales.
          </p>
          <p>
            <b>Qué contienen los correos:</b> solo tu nombre y las indicaciones
            del ejercicio recomendado. Nunca incluyen información sensible.
          </p>
          <p>
            <b>Tus derechos:</b> puedes dejar de recibir recordatorios en
            cualquier momento con el enlace «Dejar de recibir recordatorios»
            que va al pie de cada correo, y puedes solicitar la corrección o
            eliminación de tus datos escribiendo al correo del proyecto.
          </p>
          <p>
            <b>Contexto del proyecto:</b> FreshBreak es un aplicativo académico
            orientado a reducir la fatiga visual digital en estudiantes
            universitarios.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/registro" className="btn-primary">
            Volver al registro
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
