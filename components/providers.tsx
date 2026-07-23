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
import { Ejercicio, EJERCICIOS, randomEjercicio } from "@/lib/exercises";
import {
  BLOQUES_EJEMPLO,
  Bloque,
  hoyIndice,
  pausasDelDia,
  recomendarIntervalo,
} from "@/lib/schedule";
import NotificationModal from "./NotificationModal";

export type Usuario = {
  correo: string;
  nombre: string;
  edad: string;
  ocupacion: string;
  correccion: "Sí" | "No";
};

type AppState = {
  user: Usuario | null;
  setUser: (u: Usuario) => void;
  score: number | null;
  setScore: (n: number) => void;
  horasPantalla: number;
  setHorasPantalla: (n: number) => void;
  bloques: Bloque[];
  setBloques: (b: Bloque[]) => void;
  intervaloMin: number;
  setIntervaloMin: (n: number) => void;
  onboarded: boolean;
  setOnboarded: (b: boolean) => void;
  seedDemo: () => void;
  teaser: (0 | 1 | 2 | null)[];
  setTeaser: (t: (0 | 1 | 2 | null)[]) => void;
  teaserDias: number[];
  setTeaserDias: (d: number[]) => void;

  // motor de pausas
  nextPauseAt: number | null;
  jornadaActiva: boolean;
  segundosRestantes: number | null;
  iniciarJornada: (delaySeg?: number) => void;
  detenerJornada: () => void;
  dispararPausaAhora: () => void;

  // cumplimiento (en sesión)
  completions: Record<string, number>;
  cumplidasHoy: number;
  programadasHoy: string[];
  registrarCumplimiento: (id: string) => void;

  // estado del envío real por Resend
  correoEstado: "enviando" | "enviado" | "error" | null;

  dark: boolean;
  toggleDark: () => void;
  showToast: (msg: string) => void;
};

const SEED_COMPLETIONS: Record<string, number> = {
  "parpadeo-consciente": 23,
  "regla-20-20-20": 15,
  "ocho-horizontal": 12,
  "enfoque-cercano-lejano": 9,
  "masaje-palpebral": 7,
  "push-up-pencil": 6,
  palming: 4,
};

const Ctx = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp debe usarse dentro de AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [horasPantalla, setHorasPantalla] = useState(6);
  const [bloques, setBloques] = useState<Bloque[]>([]);
  const [intervaloMin, setIntervaloMin] = useState(60);
  const [onboarded, setOnboarded] = useState(false);

  const [nextPauseAt, setNextPauseAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [pausaActual, setPausaActual] = useState<Ejercicio | null>(null);
  const [correoEstado, setCorreoEstado] = useState<
    "enviando" | "enviado" | "error" | null
  >(null);

  const [completions, setCompletions] = useState<Record<string, number>>(SEED_COMPLETIONS);
  const [cumplidasHoy, setCumplidasHoy] = useState(2);

  // Respuestas del mini CVS-Q y días marcados en la landing: precargan
  // la encuesta y el horario para no pedir nada dos veces.
  const [teaser, setTeaser] = useState<(0 | 1 | 2 | null)[]>([null, null, null]);
  const [teaserDias, setTeaserDias] = useState<number[]>([]);

  // El mundo marino oscuro es el tema por defecto; claro queda en el toggle.
  const [dark, setDark] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    if (localStorage.getItem("pv-theme") === "light") setDark(false);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("pv-theme", dark ? "dark" : "light");
  }, [dark]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  // Reloj del motor de pausas: cuando llega la hora, se dispara la
  // notificación global con un ejercicio aleatorio (como el correo).
  useEffect(() => {
    const iv = window.setInterval(() => {
      setNow(Date.now());
      setNextPauseAt((npa) => {
        if (npa !== null && Date.now() >= npa) {
          setPausaActual((p) => p ?? randomEjercicio());
          return null;
        }
        return npa;
      });
    }, 1000);
    return () => window.clearInterval(iv);
  }, []);

  // Cuando llega una pausa, el recordatorio también se envía de verdad por
  // correo (Resend) a la dirección registrada.
  useEffect(() => {
    if (!pausaActual || !user) {
      setCorreoEstado(null);
      return;
    }
    setCorreoEstado("enviando");
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correo: user.correo,
        nombre: user.nombre,
        ejercicioId: pausaActual.id,
        intervaloMin,
      }),
    })
      .then((r) => r.json())
      .then((d) => setCorreoEstado(d.ok ? "enviado" : "error"))
      .catch(() => setCorreoEstado("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pausaActual]);

  const iniciarJornada = useCallback(
    (delaySeg?: number) => {
      setNextPauseAt(Date.now() + (delaySeg ?? intervaloMin * 60) * 1000);
    },
    [intervaloMin]
  );
  const detenerJornada = useCallback(() => setNextPauseAt(null), []);
  const dispararPausaAhora = useCallback(() => {
    setNextPauseAt(null);
    setPausaActual(randomEjercicio());
  }, []);

  const registrarCumplimiento = useCallback(
    (id: string) => {
      setCompletions((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
      setCumplidasHoy((n) => n + 1);
      showToast("✓ Recordatorio cumplido · registrado en tu historial 🎉");
    },
    [showToast]
  );

  const seedDemo = useCallback(() => {
    setUser({
      correo: "maria.fernanda@universidad.edu.co",
      nombre: "María Fernanda",
      edad: "21",
      ocupacion: "Estudiante universitaria",
      correccion: "Sí",
    });
    setScore(9);
    setHorasPantalla(8);
    setBloques(BLOQUES_EJEMPLO);
    setIntervaloMin(recomendarIntervalo(9, 8));
    setOnboarded(true);
  }, []);

  const segundosRestantes =
    nextPauseAt === null ? null : Math.max(0, Math.ceil((nextPauseAt - now) / 1000));

  const programadasHoy = pausasDelDia(bloques, hoyIndice(), intervaloMin);

  function cerrarPausa(posponer: boolean) {
    setPausaActual(null);
    // Posponer = repetir en 5 min (o el intervalo demo si es más corto);
    // continuar = siguiente pausa al intervalo normal.
    const demo = intervaloMin * 60 <= 60;
    if (posponer) iniciarJornada(demo ? intervaloMin * 60 : 5 * 60);
    else iniciarJornada();
  }

  return (
    <Ctx.Provider
      value={{
        user,
        setUser,
        score,
        setScore,
        horasPantalla,
        setHorasPantalla,
        bloques,
        setBloques,
        intervaloMin,
        setIntervaloMin,
        onboarded,
        setOnboarded,
        seedDemo,
        teaser,
        setTeaser,
        teaserDias,
        setTeaserDias,
        nextPauseAt,
        jornadaActiva: nextPauseAt !== null,
        segundosRestantes,
        iniciarJornada,
        detenerJornada,
        dispararPausaAhora,
        completions,
        cumplidasHoy,
        programadasHoy,
        registrarCumplimiento,
        correoEstado,
        dark,
        toggleDark: () => setDark((d) => !d),
        showToast,
      }}
    >
      {children}

      {/* La notificación de pausa es global: llega estés donde estés en la app */}
      <AnimatePresence>
        {pausaActual && (
          <NotificationModal
            ejercicio={pausaActual}
            onRealizar={() => setPausaActual(null)}
            onPosponer={() => cerrarPausa(true)}
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white shadow-2xl dark:bg-marine-line dark:text-marine-bg"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
