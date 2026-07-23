"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useAnimationFrame } from "framer-motion";
import { EyeHero, EyeMark } from "@/components/Logo";
import {
  IconCampana,
  IconCorreo,
  IconEncuesta,
  IconGrafico,
  IconOjo,
} from "@/components/icons";
import { useApp } from "@/components/providers";
import { PREGUNTAS } from "@/lib/cvsq";
import { DIAS, DIAS_CORTO, pausasDelDia } from "@/lib/schedule";

const DOT_STYLE: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: "50%",
  background: "#F79A56",
  boxShadow:
    "0 0 0 2px rgba(255,255,255,0.5), 0 0 18px rgba(247,154,86,0.85), 0 0 36px rgba(247,154,86,0.35)",
  willChange: "transform",
};

/* Punto naranja que recorre la línea punteada del hero cada cierto tiempo */
function LineaConPunto() {
  const boxRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const t = useRef(0);

  useAnimationFrame((_, delta) => {
    const box = boxRef.current;
    const dot = dotRef.current;
    if (!box || !dot) return;
    t.current = (t.current + Math.min(delta, 64) / 1000) % 11;
    const fase = t.current;
    if (fase < 7) {
      const p = fase / 7;
      dot.style.opacity = "1";
      dot.style.transform = `translate(${p * (box.clientWidth - 22)}px, -8px)`;
    } else {
      dot.style.opacity = "0";
    }
  });

  return (
    <div ref={boxRef} className="relative h-[6px] w-full">
      <div className="dashed-line absolute inset-x-0 top-0 h-[6px] opacity-40 dark:opacity-80" />
      <div ref={dotRef} className="absolute left-0 top-0" style={DOT_STYLE} />
    </div>
  );
}

/* Sigue el punto: el ∞ punteado con el punto naranja en vivo */
function DemoOcho() {
  const boxRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const theta = useRef(0);

  useAnimationFrame((_, delta) => {
    const box = boxRef.current;
    const dot = dotRef.current;
    if (!box || !dot) return;
    theta.current += (Math.min(delta, 64) / 1000) * ((Math.PI * 2) / 7);
    const w = box.clientWidth;
    const h = box.clientHeight;
    const x = w / 2 + w * 0.42 * Math.sin(theta.current);
    const y = h / 2 + h * 0.36 * Math.sin(2 * theta.current);
    dot.style.transform = `translate(${x - 11}px, ${y - 11}px)`;
  });

  const puntos = useMemo(() => {
    const pts: string[] = [];
    for (let t = 0; t <= Math.PI * 2 + 0.001; t += 0.045) {
      pts.push(
        `${(50 + 42 * Math.sin(t)).toFixed(2)},${(30 + 21.6 * Math.sin(2 * t)).toFixed(2)}`
      );
    }
    return pts.join(" ");
  }, []);

  return (
    <div ref={boxRef} className="relative h-52 w-full sm:h-64">
      <svg
        className="absolute inset-0 h-full w-full text-brand-tealDark dark:text-marine-line"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        aria-hidden
      >
        <polyline
          points={puntos}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.55"
          strokeWidth="2"
          strokeDasharray="0.2 2.4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div ref={dotRef} className="absolute left-0 top-0" style={{ ...DOT_STYLE, width: 22, height: 22 }} />
    </div>
  );
}

/* Mini CVS-Q: 3 preguntas reales con medidor, precarga la encuesta completa */
const MINI = [
  { idx: 0, corto: "¿Visión borrosa durante o después de usar pantallas?" },
  { idx: 1, corto: "¿Dificultad para enfocar objetos cercanos?" },
  { idx: 3, corto: "¿Dolor de cabeza tras usar dispositivos?" },
];
const OPCIONES = ["Nunca", "A veces", "Seguido"];

function MiniCVSQ() {
  const { teaser, setTeaser } = useApp();
  const respondidas = teaser.filter((t) => t !== null).length;
  const puntos = teaser.reduce<number>((s, t) => s + (t ?? 0), 0);
  const completo = respondidas === 3;

  function responder(i: number, v: 0 | 1 | 2) {
    const nuevo = [...teaser];
    nuevo[i] = v;
    setTeaser(nuevo);
  }

  return (
    <div className="card flex h-full flex-col">
      <div className="flex items-center gap-2">
        <IconOjo className="h-6 w-6 text-brand-tealDark" />
        <h3 className="m-0 text-lg font-bold">CVS-Q</h3>
      </div>
      <p className="mb-4 mt-1 text-sm text-ink/60">
        Descubre tu nivel de fatiga visual. Empieza con 3 preguntas:
      </p>
      <div className="flex-1 space-y-3">
        {MINI.map((m, i) => (
          <div key={m.idx}>
            <p className="mb-1.5 text-[13px] font-semibold leading-snug">{m.corto}</p>
            <div className="grid grid-cols-3 gap-1.5">
              {OPCIONES.map((o, oi) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => responder(i, oi as 0 | 1 | 2)}
                  aria-pressed={teaser[i] === oi}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition ${
                    teaser[i] === oi
                      ? "border-ink bg-ink text-white"
                      : "border-ink/15 bg-mist-bg text-ink/70 hover:border-ink/40"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink/10 pt-3">
        <div className="relative h-12 w-12 flex-none">
          <svg viewBox="0 0 40 40" className="-rotate-90">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#0E3B3B" strokeOpacity="0.12" strokeWidth="5" />
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke={puntos >= 3 ? "#D9711C" : "#17A398"}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 16}
              strokeDashoffset={2 * Math.PI * 16 * (1 - respondidas / 3)}
              style={{ transition: "stroke-dashoffset 0.4s ease" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums">
            {respondidas}/3
          </span>
        </div>
        {completo ? (
          <Link href="/registro" className="btn-primary flex-1 px-3 py-2.5 text-center text-sm">
            Completar cuestionario →
          </Link>
        ) : (
          <p className="flex-1 text-right text-xs text-ink/50">
            Tus respuestas se guardan para el cuestionario completo
          </p>
        )}
      </div>
    </div>
  );
}

/* Esta semana: marca tus días de estudio y mira tus horas de recordatorio */
function SemanaWidget() {
  const { teaserDias, setTeaserDias } = useApp();
  const primerDia = teaserDias.length ? Math.min(...teaserDias) : null;
  const horas =
    primerDia !== null
      ? pausasDelDia([{ dia: primerDia, inicio: 8, fin: 12 }], primerDia, 30)
      : [];

  function toggleDia(d: number) {
    setTeaserDias(
      teaserDias.includes(d)
        ? teaserDias.filter((x) => x !== d)
        : [...teaserDias, d]
    );
  }

  return (
    <div className="card flex h-full flex-col">
      <div className="flex items-center gap-2">
        <IconCampana className="h-6 w-6 text-brand-tealDark" />
        <h3 className="m-0 text-lg font-bold">Esta semana</h3>
      </div>
      <p className="mb-4 mt-1 text-sm text-ink/60">
        Marca tus días de estudio y mira cuándo te recordaríamos:
      </p>
      <div className="grid grid-cols-7 gap-1.5">
        {DIAS_CORTO.map((d, di) => (
          <button
            key={d}
            type="button"
            onClick={() => toggleDia(di)}
            aria-pressed={teaserDias.includes(di)}
            className={`rounded-lg border py-2 text-xs font-bold transition ${
              teaserDias.includes(di)
                ? "border-brand-tealDark bg-brand-tealDark text-white"
                : "border-ink/15 bg-mist-bg text-ink/60 hover:border-ink/40"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="mt-4 flex-1">
        {primerDia !== null ? (
          <div className="rounded-xl bg-mist-tint p-3">
            <p className="m-0 text-xs font-semibold text-ink/70">
              {DIAS[primerDia]}, con un bloque de 8:00 a 12:00 y pausas cada 30 min:
            </p>
            <p className="m-0 mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[13px] font-semibold tabular-nums">
              {horas.map((h) => (
                <span key={h} className="inline-flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-brand-orange" />
                  {h}
                </span>
              ))}
            </p>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-ink/20 p-3 text-center text-xs text-ink/50">
            Toca un día para ver el ejemplo
          </p>
        )}
      </div>
      <div className="mt-4 border-t border-ink/10 pt-3">
        <Link href="/registro" className="btn-primary w-full px-3 py-2.5 text-sm">
          Configurar mi horario real →
        </Link>
      </div>
    </div>
  );
}

/* Recordatorio: la notificación tal como llega, con botón real */
function RecordatorioCard() {
  return (
    <div className="card flex h-full flex-col">
      <div className="flex items-center gap-2">
        <IconCorreo className="h-6 w-6 text-brand-tealDark" />
        <h3 className="m-0 text-lg font-bold">Recordatorio</h3>
      </div>
      <p className="mb-4 mt-1 text-sm text-ink/60">
        Así llega, en la app y a tu correo:
      </p>
      <div className="flex-1 rounded-xl bg-mist-tint p-4 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold">
            <EyeMark className="w-6 text-ink" /> FreshBreak
          </span>
          <span className="text-[11px] text-ink/50">Ahora</span>
        </div>
        <p className="mb-0 mt-2 text-sm font-bold">Es momento de descansar la vista</p>
        <p className="m-0 mt-1 text-xs text-ink/65">
          Llevas 2 horas en pantalla. Mira a 20 pies (6 m) durante 20 segundos.
        </p>
        <Link
          href="/ejercicio/regla-20-20-20"
          className="btn-primary mt-3 w-full px-3 py-2 text-xs"
        >
          Tomar pausa ahora
        </Link>
      </div>
      <p className="m-0 mt-3 text-center text-[11px] text-ink/45">
        Programado según tu horario académico · nunca fuera de tus bloques
      </p>
    </div>
  );
}

const SERVICIOS = [
  {
    Icon: IconEncuesta,
    nombre: "Evaluación CVS-Q",
    desc: "El cuestionario de síndrome visual informático, con tu resultado al instante.",
    href: "/registro",
  },
  {
    Icon: IconOjo,
    nombre: "Pausas activas guiadas",
    desc: "7 ejercicios con guía visual animada, instrucciones y cronómetro.",
    href: "/ejercicio/parpadeo-consciente",
  },
  {
    Icon: IconCorreo,
    nombre: "Recordatorios en la app y por correo",
    desc: "Programados dentro de tus bloques de estudio, con el ejercicio del momento.",
    href: "#widgets",
  },
  {
    Icon: IconGrafico,
    nombre: "Registro de cumplimiento",
    desc: "Cumplimiento semanal, evolución de síntomas y tus ejercicios más realizados.",
    href: "/registro",
  },
];

const CIENCIA = [
  {
    t: "Parpadeamos hasta un 60 % menos frente a pantallas",
    d: "El parpadeo consciente restablece la película lagrimal y alivia la sequedad ocular.",
  },
  {
    t: "La regla 20-20-20 relaja la acomodación",
    d: "Cada 20 minutos, mirar 20 segundos a 20 pies (6 m) reduce la fatiga acomodativa.",
  },
  {
    t: "El movimiento amplio ejercita los músculos oculares",
    d: "Seguir un recorrido en ocho estimula la movilidad y reduce la rigidez ocular.",
  },
  {
    t: "El calor estimula las glándulas de Meibomio",
    d: "El masaje palpebral mejora la capa lipídica de la lágrima y estabiliza la visión.",
  },
  {
    t: "La oscuridad total descansa la retina",
    d: "El palming permite que retina y mente se recuperen del estímulo lumínico constante.",
  },
];

const FAQS = [
  {
    q: "¿Cómo llegan los recordatorios?",
    a: "Por dos canales: una notificación dentro de la aplicación y un correo electrónico con el ejercicio recomendado, sus pasos y su duración. Siempre dentro de tus bloques de estudio registrados, nunca fuera de ellos.",
  },
  {
    q: "¿Cómo se personaliza mi intervalo de pausas?",
    a: "Con tu puntaje del CVS-Q y tus horas diarias de pantalla: síntomas altos o mucha exposición sugieren pausas cada 20 o 30 minutos; un nivel bajo mantiene el estándar de 60 minutos. Siempre puedes ajustarlo desde tu panel.",
  },
  {
    q: "¿Qué es el CVS-Q?",
    a: "El Computer Vision Syndrome Questionnaire: un cuestionario de 16 preguntas sobre la frecuencia e intensidad de los síntomas de fatiga visual digital, como visión borrosa, sequedad o dolor de cabeza.",
  },
  {
    q: "¿Por qué el ejercicio de cada pausa es aleatorio?",
    a: "Para cubrir las distintas necesidades del ojo: lubricación, enfoque, movilidad y descanso. Cada pausa trabaja algo diferente y la variedad evita que la rutina se vuelva mecánica.",
  },
  {
    q: "¿Qué datos guardan sobre mí?",
    a: "Solo tu nombre registrado y las indicaciones de los ejercicios. Los correos no incluyen información personal sensible, siguiendo la Ley 1581 de 2012 y el Decreto 1377 de 2013 de protección de datos.",
  },
  {
    q: "¿Puedo cambiar mi horario después?",
    a: "Sí. Desde tu panel puedes editar tus bloques de estudio, tu perfil y el intervalo entre pausas en cualquier momento.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { seedDemo } = useApp();
  const [faqAbierta, setFaqAbierta] = useState<number | null>(0);

  return (
    <div className="relative left-1/2 -mb-20 -mt-8 w-screen -translate-x-1/2 overflow-x-clip">
      {/* ============ HERO ============ */}
      <section
        id="inicio"
        className="grain relative overflow-hidden bg-mist-bg dark:bg-marine-bg"
      >
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-6 px-4 pb-16 pt-10 lg:grid-cols-[1fr_1.1fr] lg:gap-2 lg:pt-6">
          <div className="order-2 lg:order-1">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl font-bold tracking-[0.04em] text-ink dark:text-white sm:text-6xl lg:text-7xl"
            >
              FRESHBREAK
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mt-2 text-sm font-bold uppercase tracking-[0.3em] text-brand-tealDark dark:text-marine-line sm:text-base"
            >
              Hora de tu pausa visual
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.5 }}
              className="mt-5 max-w-md text-ink/70 dark:text-mist-tint/75"
            >
              La app de cuidado visual que programa tus pausas dentro de tu
              horario académico y te guía ejercicio por ejercicio.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/registro"
                className="btn-primary dark:bg-marine-line dark:text-marine-bg dark:hover:bg-[#5FD9D2]"
              >
                Crear mi plan →
              </Link>
              <button
                onClick={() => {
                  seedDemo();
                  router.push("/panel");
                }}
                className="text-sm font-semibold text-ink/60 underline underline-offset-4 transition hover:text-ink dark:text-mist-tint/60 dark:hover:text-white"
              >
                o explora la demo
              </button>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <EyeHero className="w-full" />
          </motion.div>
        </div>
        {/* línea punteada que cruza toda la pantalla a la altura del iris */}
        <div className="absolute inset-x-0 top-[56%] z-0 hidden lg:block">
          <LineaConPunto />
        </div>
      </section>

      {/* ============ SIGUE EL PUNTO ============ */}
      <section className="grain bg-mist-tint dark:bg-[#04211F]">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-ink dark:text-white">
              <IconOjo className="h-6 w-6 text-brand-tealDark dark:text-marine-line" />
              Sigue el punto
            </h2>
            <p className="mt-2 text-sm text-ink/65 dark:text-mist-tint/65">
              Relaja tus ojos siguiendo el punto naranja con un movimiento
              suave, sin mover la cabeza. Acabas de hacer tu primer ejercicio.
            </p>
          </div>
          <DemoOcho />
        </div>
      </section>

      {/* ============ WIDGETS EN VIVO ============ */}
      <section id="widgets" className="grain bg-mist-bg dark:bg-marine-bg">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-5 md:grid-cols-3">
            <MiniCVSQ />
            <SemanaWidget />
            <RecordatorioCard />
          </div>
        </div>
      </section>

      {/* ============ SERVICIOS ============ */}
      <section id="servicios" className="grain bg-mist-bg dark:bg-marine-bg">
        <div className="mx-auto max-w-5xl px-4 pb-14 pt-2">
          <h2 className="text-center text-sm font-bold uppercase tracking-[0.35em] text-ink/60 dark:text-mist-tint/60">
            Servicios
          </h2>
          <div className="mt-6 space-y-3">
            {SERVICIOS.map(({ Icon, nombre, desc, href }) => (
              <Link
                key={nombre}
                href={href}
                className="group flex items-center gap-4 rounded-2xl border border-ink/15 bg-white/60 px-5 py-4 transition hover:border-brand-tealDark hover:bg-white dark:border-marine-line/25 dark:bg-marine-deep/40 dark:hover:border-marine-line/70 dark:hover:shadow-glowTeal"
              >
                <span className="flex-none text-brand-tealDark dark:text-marine-line">
                  <Icon />
                </span>
                <span className="flex-1">
                  <span className="block font-bold text-ink dark:text-white">{nombre}</span>
                  <span className="block text-sm text-ink/60 dark:text-mist-tint/60">{desc}</span>
                </span>
                <span className="flex-none text-brand-tealDark transition group-hover:translate-x-1 dark:text-marine-line">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CIENCIA ============ */}
      <section id="ciencia" className="grain bg-mist-tint dark:bg-[#04211F]">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-center text-2xl font-bold text-ink dark:text-white">
            La ciencia detrás
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-ink/65 dark:text-mist-tint/65">
            Cada ejercicio de FreshBreak existe por una razón fisiológica
            concreta, y el CVS-Q mide tus síntomas para dosificarlos.
          </p>
          <div className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {CIENCIA.map((c) => (
              <div key={c.t} className="border-l-2 border-brand-tealDark/50 pl-4 dark:border-marine-line/50">
                <p className="m-0 font-bold text-ink dark:text-white">{c.t}</p>
                <p className="m-0 mt-1 text-sm text-ink/65 dark:text-mist-tint/65">{c.d}</p>
              </div>
            ))}
            <div className="border-l-2 border-brand-orange/60 pl-4">
              <p className="m-0 font-bold text-ink dark:text-white">
                El CVS-Q® como punto de partida
              </p>
              <p className="m-0 mt-1 text-sm text-ink/65 dark:text-mist-tint/65">
                16 preguntas sobre frecuencia e intensidad de síntomas definen
                tu nivel de fatiga y la frecuencia de tus pausas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA ============ */}
      <section id="como-funciona" className="grain bg-mist-bg dark:bg-marine-bg">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-center text-2xl font-bold text-ink dark:text-white">
            ¿Cómo funciona?
          </h2>
          <div className="relative mt-10">
            <div className="dashed-line absolute left-0 right-0 top-[9px] hidden h-[4px] opacity-40 dark:opacity-70 md:block" />
            <div className="grid gap-8 md:grid-cols-4">
              {[
                { t: "Regístrate", d: "Nombre, correo, edad y ocupación. Sin contraseñas." },
                { t: "Responde el CVS-Q", d: "16 preguntas miden tu fatiga visual digital." },
                { t: "Registra tu horario", d: "Tus bloques de estudio y horas de pantalla." },
                { t: "Recibe tus pausas", d: "Recordatorios con ejercicios guiados, en app y correo." },
              ].map((p, i) => (
                <div key={p.t} className="relative">
                  <span className="mb-3 block h-[22px] w-[22px] rounded-full border-2 border-white bg-brand-orange shadow-[0_0_14px_rgba(247,154,86,0.7)] dark:border-marine-bg" />
                  <p className="m-0 font-bold text-ink dark:text-white">
                    {i + 1}. {p.t}
                  </p>
                  <p className="m-0 mt-1 text-sm text-ink/60 dark:text-mist-tint/60">{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="grain bg-mist-tint dark:bg-[#04211F]">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <h2 className="text-center text-2xl font-bold text-ink dark:text-white">
            Preguntas frecuentes
          </h2>
          <div className="mt-8 space-y-3">
            {FAQS.map((f, i) => (
              <div
                key={f.q}
                className="overflow-hidden rounded-2xl border border-ink/15 bg-white/70 dark:border-marine-line/25 dark:bg-marine-deep/40"
              >
                <button
                  onClick={() => setFaqAbierta(faqAbierta === i ? null : i)}
                  aria-expanded={faqAbierta === i}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-semibold text-ink dark:text-white"
                >
                  {f.q}
                  <span
                    className={`flex-none text-brand-tealDark transition-transform dark:text-marine-line ${
                      faqAbierta === i ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {faqAbierta === i && (
                  <p className="m-0 px-5 pb-4 text-sm leading-relaxed text-ink/70 dark:text-mist-tint/70">
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-mist-tint via-[#AEEBEA] to-[#40BFC0] dark:from-[#04211F] dark:via-[#0A3F40] dark:to-[#177E7C]">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <EyeMark className="mx-auto w-14 text-ink dark:text-white" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-ink/70 dark:text-white/70">
            Tus ojos trabajan duro por ti
          </p>
          <h2 className="mt-2 text-3xl font-bold text-ink dark:text-white sm:text-4xl">
            Dales la pausa que merecen.
          </h2>
          <Link
            href="/registro"
            className="btn-primary mt-8 px-10 dark:bg-white dark:text-marine-bg dark:hover:bg-mist-tint"
          >
            Crear mi plan →
          </Link>
        </div>
        <footer className="border-t border-ink/10 bg-ink/5 py-5 text-center text-[11px] text-ink/60 dark:border-white/10 dark:bg-black/20 dark:text-white/60">
          <p className="m-0">
            FreshBreak · Demo académica · Datos protegidos según la Ley 1581 de
            2012 y el Decreto 1377 de 2013 — los correos solo incluyen tu nombre
            y las indicaciones del ejercicio.
          </p>
        </footer>
      </section>
    </div>
  );
}
