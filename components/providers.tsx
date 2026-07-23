"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

export type Usuario = {
  correo: string;
  nombre: string;
  edad: string;
  ocupacion: string;
  correccion: "Sí" | "No";
};

type AppState = {
  user: Usuario;
  setUser: (u: Usuario) => void;
  score: number | null;
  setScore: (n: number) => void;
  dark: boolean;
  toggleDark: () => void;
  pauseSeconds: number;
  setPauseSeconds: (n: number) => void;
  showToast: (msg: string) => void;
};

// Usuario semilla: todo el flujo es navegable sin pasar por el registro.
const seedUser: Usuario = {
  correo: "maria.fernanda@universidad.edu.co",
  nombre: "María Fernanda",
  edad: "21",
  ocupacion: "Estudiante universitaria",
  correccion: "Sí",
};

const Ctx = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp debe usarse dentro de AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario>(seedUser);
  const [score, setScore] = useState<number | null>(null);
  const [dark, setDark] = useState(false);
  const [pauseSeconds, setPauseSeconds] = useState(3600);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    if (localStorage.getItem("pv-dark") === "1") setDark(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("pv-dark", dark ? "1" : "0");
  }, [dark]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        setUser,
        score,
        setScore,
        dark,
        toggleDark: () => setDark((d) => !d),
        pauseSeconds,
        setPauseSeconds,
        showToast,
      }}
    >
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="rounded-full bg-brand-accent px-6 py-3 text-sm font-semibold text-white shadow-2xl dark:bg-sky-400 dark:text-brand-dark"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
