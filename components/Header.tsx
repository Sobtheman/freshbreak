"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "./providers";
import { EyeMark } from "./Logo";
import { IconLuna, IconSol } from "./icons";

const ANCLAS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#servicios", label: "Servicios" },
  { href: "#ciencia", label: "Ciencia" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#faq", label: "FAQ" },
  { href: "#contacto", label: "Contacto" },
];

export default function Header() {
  const { dark, toggleDark, onboarded } = useApp();
  const pathname = usePathname();
  const enLanding = pathname === "/";
  // Por debajo de lg los enlaces de sección no caben en la barra: van en un
  // panel desplegable para que en móvil y tablet sigan siendo alcanzables.
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    if (!menuAbierto) return;
    const cerrar = (e: KeyboardEvent) => e.key === "Escape" && setMenuAbierto(false);
    window.addEventListener("keydown", cerrar);
    return () => window.removeEventListener("keydown", cerrar);
  }, [menuAbierto]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/80 backdrop-blur-md dark:border-marine-line/15 dark:bg-marine-bg/85">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex flex-none items-center gap-2.5">
          <EyeMark className="w-10 text-ink dark:text-marine-line" />
          <span className="flex flex-col leading-tight">
            <span className="text-[15px] font-bold tracking-[0.08em] text-ink dark:text-white">
              FRESHBREAK
            </span>
            <span className="hidden text-[9px] font-semibold uppercase tracking-[0.18em] text-brand-tealDark dark:text-marine-line sm:block">
              Hora de tu pausa visual
            </span>
          </span>
        </Link>

        {enLanding && (
          <nav className="hidden items-center gap-1 lg:flex">
            {ANCLAS.map((a) => (
              <a
                key={a.href}
                href={a.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink/75 transition hover:text-ink dark:text-mist-tint/70 dark:hover:text-white"
              >
                {a.label}
              </a>
            ))}
          </nav>
        )}

        <nav className="flex items-center gap-2">
          {enLanding ? (
            <Link
              href="/registro"
              className="btn-primary hidden px-4 py-2 text-sm dark:bg-marine-line dark:text-marine-bg dark:hover:bg-[#5FD9D2] sm:inline-flex"
            >
              Crear mi plan
            </Link>
          ) : (
            <Link
              href={onboarded ? "/panel" : "/"}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-tealDark transition hover:bg-ink/5 dark:text-marine-line dark:hover:bg-white/5"
            >
              {onboarded ? "Mi panel" : "Inicio"}
            </Link>
          )}
          <button
            onClick={toggleDark}
            aria-label={dark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            className="flex h-9 items-center gap-1.5 rounded-full border border-ink/20 bg-white px-3 text-xs font-semibold text-ink transition hover:border-ink/40 dark:border-marine-line/30 dark:bg-marine-deep dark:text-mist-tint dark:hover:border-marine-line/60"
          >
            <span aria-hidden>
              {dark ? <IconSol className="h-4 w-4" /> : <IconLuna className="h-4 w-4" />}
            </span>
            <span className="hidden sm:inline">{dark ? "Claro" : "Oscuro"}</span>
          </button>
          {enLanding && (
            <button
              onClick={() => setMenuAbierto((v) => !v)}
              aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuAbierto}
              aria-controls="menu-movil"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/20 bg-white text-ink transition hover:border-ink/40 dark:border-marine-line/30 dark:bg-marine-deep dark:text-mist-tint dark:hover:border-marine-line/60 lg:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                {menuAbierto ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          )}
        </nav>
      </div>

      {enLanding && menuAbierto && (
        <nav
          id="menu-movil"
          className="border-t border-ink/10 bg-white/95 backdrop-blur-md dark:border-marine-line/15 dark:bg-marine-bg/95 lg:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            {ANCLAS.map((a) => (
              <a
                key={a.href}
                href={a.href}
                onClick={() => setMenuAbierto(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-ink/80 transition hover:bg-ink/5 hover:text-ink dark:text-mist-tint/80 dark:hover:bg-white/5 dark:hover:text-white"
              >
                {a.label}
              </a>
            ))}
            <Link
              href="/registro"
              onClick={() => setMenuAbierto(false)}
              className="btn-primary mt-2 justify-center py-3 dark:bg-marine-line dark:text-marine-bg dark:hover:bg-[#5FD9D2] sm:hidden"
            >
              Crear mi plan
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
