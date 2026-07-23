"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useApp } from "./providers";
import { EyeMark } from "./Logo";

export default function Header() {
  const { dark, toggleDark } = useApp();

  return (
    <header className="sticky top-0 z-40 border-b border-brand-accent/10 bg-white/75 backdrop-blur-md dark:border-white/10 dark:bg-brand-dark/80">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <EyeMark className="w-11" />
          <span className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-[0.05em] text-[#0E2A47] dark:text-slate-100">
              FRESHBREAK
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-tealDark dark:text-brand-teal">
              Hora de tu pausa visual
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/panel"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-accent transition hover:bg-brand-accent/10 dark:text-sky-200 dark:hover:bg-white/10"
          >
            Mi panel
          </Link>
          <button
            onClick={toggleDark}
            aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-accent/20 bg-white text-lg transition hover:scale-105 dark:border-white/15 dark:bg-brand-card"
          >
            <motion.span
              key={dark ? "sol" : "luna"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              {dark ? "☀️" : "🌙"}
            </motion.span>
          </button>
        </nav>
      </div>
    </header>
  );
}
