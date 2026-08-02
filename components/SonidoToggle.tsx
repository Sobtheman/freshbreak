"use client";

import { useSonido } from "@/lib/sonido";

// Botón para silenciar las señales sonoras del ejercicio. Además, al tocarlo
// se desbloquea el audio del navegador (que lo bloquea hasta el primer gesto).
export default function SonidoToggle() {
  const { activo, alternar } = useSonido();
  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={activo}
      className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-ink/5"
      title={
        activo
          ? "Las señales sonoras te avisan cuándo abrir los ojos o cambiar de enfoque"
          : "Activa el sonido para guiarte sin mirar la pantalla"
      }
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 9.5v5h3.2L12 18.5v-13L7.2 9.5H4z" />
        {activo ? (
          <>
            <path d="M15.4 9.2a4 4 0 0 1 0 5.6" />
            <path d="M17.9 6.7a7.5 7.5 0 0 1 0 10.6" />
          </>
        ) : (
          <path d="M16 10l4 4M20 10l-4 4" />
        )}
      </svg>
      {activo ? "Sonido activado" : "Sonido silenciado"}
    </button>
  );
}
