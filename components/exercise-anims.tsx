"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationFrame } from "framer-motion";
import { type Senal, useSonido } from "@/lib/sonido";

/*
 * Guías visuales v3. Patrones de las apps de entrenamiento ocular guiado:
 *  - seguimiento suave: punto a velocidad LINEAL constante (parametrizado por
 *    longitud de arco, no por ángulo)
 *  - parpadeo: párpado real que baja y sube al ritmo del ejercicio (2 s cerrado)
 *  - acomodación: la pantalla marca el ritmo SIN exigir mirarla fija
 *  - relajación (ojos cerrados): la guía enseña la preparación y acompaña
 *  - 20-20-20: la pantalla se apaga para empujar la mirada fuera de ella
 */

const DOT_STYLE: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: "50%",
  background: "#F79A56",
  boxShadow:
    "0 0 0 2px rgba(255,255,255,0.55), 0 0 18px rgba(247,154,86,0.85), 0 0 34px rgba(247,154,86,0.35)",
  willChange: "transform",
};

function useSegundos() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const iv = window.setInterval(() => setT((x) => x + 1), 1000);
    return () => window.clearInterval(iv);
  }, []);
  return t;
}

// Dispara una señal sonora cada vez que `fase` cambia (no en el primer
// render). Es la forma de avisar con los ojos cerrados o la vista lejos de
// la pantalla, que es donde la guía visual no sirve.
function useSenalDeFase(
  fase: string | number,
  senal: Senal | null,
  // Algunos ejercicios necesitan la instrucción desde el segundo cero
  // (p. ej. "empieza enfocando cerca"): con `inicial` también suena al montar.
  inicial = false
) {
  const { sonar } = useSonido();
  const previa = useRef<string | number | null>(null);
  useEffect(() => {
    const primeraVez = previa.current === null;
    if (senal && ((primeraVez && inicial) || (!primeraVez && previa.current !== fase))) {
      sonar(senal);
    }
    previa.current = fase;
    // `inicial` solo importa en el montaje
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, senal, sonar]);
}

/* ---------- 1. Parpadeo consciente ----------
 * Ciclo por parpadeo: 4 s (abierto 2 s, cerrado 2 s) × 10 reps = 40 s,
 * descanso 10 s → ronda de 50 s; el párpado es una tapa real que baja. */
export function ParpadeoAnim() {
  const t = useSegundos();
  const enRonda = t % 50;
  const parpadeando = enRonda < 40;
  const rep = parpadeando ? Math.floor(enRonda / 4) + 1 : 10;
  const cerrado = parpadeando && enRonda % 4 >= 2;
  const ronda = Math.floor(t / 50) + 1;

  // Sonido: cierre y apertura de cada parpadeo, aviso al entrar al descanso y
  // aviso de arranque al reanudar (en el descanso los ojos ya están abiertos,
  // así que ahí "abrir" no tendría sentido).
  const reanuda = parpadeando && enRonda < 2 && ronda > 1;
  useSenalDeFase(
    parpadeando ? `p${Math.floor(enRonda / 2)}` : "descanso",
    !parpadeando ? "fin" : reanuda ? "cambio" : cerrado ? "cerrar" : "abrir"
  );

  return (
    <div className="flex flex-col items-center gap-5">
      <svg width="220" height="140" viewBox="0 0 220 140" aria-hidden>
        <defs>
          <clipPath id="ojoClip">
            <path d="M20 70 Q110 -14 200 70 Q110 154 20 70 Z" />
          </clipPath>
        </defs>
        {/* globo ocular */}
        <path
          d="M20 70 Q110 -14 200 70 Q110 154 20 70 Z"
          fill="#FFFFFF"
        />
        <g clipPath="url(#ojoClip)">
          <circle cx="110" cy="70" r="34" className="fill-brand-tealDark" />
          <circle cx="110" cy="70" r="15" fill="#071A2B" />
          <ellipse cx="99" cy="57" rx="9" ry="7" fill="#fff" opacity="0.95" />
          {/* párpado: tapa cuyo borde inferior coincide con el contorno del
             ojo al cerrar, de modo que lo cubre POR COMPLETO (nada de ojo a
             medio cerrar) */}
          <g
            style={{
              transform: cerrado ? "translateY(0px)" : "translateY(-160px)",
              transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <path
              d="M-10 -100 H230 V70 Q110 154 -10 70 Z"
              className="fill-brand-tealDeep"
            />
            {/* línea de pestañas del párpado cerrado */}
            <path
              d="M-10 70 Q110 154 230 70"
              fill="none"
              stroke="#0E2A47"
              strokeWidth="3.5"
              opacity="0.55"
            />
          </g>
        </g>
        {/* contorno */}
        <path
          d="M20 70 Q110 -14 200 70 Q110 154 20 70 Z"
          fill="none"
          className="stroke-[#0E2A47]"
          strokeWidth="6"
        />
      </svg>

      <div className="text-center">
        <AnimatePresence mode="wait">
          {parpadeando ? (
            <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* La instrucción es lo principal; el conteo va encima, más
                 pequeño. Antes decía "cierra…" al final de la línea y se leía
                 como un texto cortado. */}
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50 tabular-nums">
                Parpadeo {rep} de 10
              </p>
              <p
                className={`mt-1 text-3xl font-bold ${
                  cerrado ? "text-brand-tealDark" : "text-[#C05E14]"
                }`}
              >
                {cerrado ? "Cierra los ojos" : "Abre los ojos"}
              </p>
              <p className="mt-1 text-sm text-ink/60">
                Ronda {ronda} · 2 segundos cerrado, 2 segundos abierto
              </p>
            </motion.div>
          ) : (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-2xl font-bold text-[#C05E14]">
                Descansa… {50 - enRonda} s
              </p>
              <p className="text-sm text-ink/60">
                Ojos abiertos y relajados antes de la siguiente ronda
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- 2. Regla 20-20-20 ----------
 * Corrección de la clienta: son DOS fases de 20 s — primero a 6 m (lejos) y
 * luego a 20 cm (cerca). La pantalla se apaga en ambas: solo queda un conteo
 * gigante legible de reojo, y el sonido avisa el cambio. */
function DiagramaDistancia({ cerca }: { cerca: boolean }) {
  return (
    <svg width="240" height="88" viewBox="0 0 240 88" aria-hidden>
      <g stroke="#7FE7DC" fill="none" strokeWidth="2" strokeLinecap="round">
        {/* ojo de perfil, siempre a la izquierda */}
        <path d="M10 35 Q22 22 34 35 Q22 48 10 35 Z" />
        <circle cx="22" cy="35" r="5" fill="#7FE7DC" stroke="none" />
        {/* línea de mirada hasta el objeto */}
        <path
          d={cerca ? "M38 35 H92" : "M38 35 H186"}
          strokeDasharray="5 6"
          opacity="0.8"
        />
      </g>
      {cerca ? (
        // objeto cercano: un lápiz a 20 cm
        <g transform="translate(100 12)">
          <rect x="6" y="10" width="9" height="34" fill="#F79A56" />
          <path d="M6 10 L10.5 0 L15 10 Z" fill="#F2C6A0" />
          <rect x="6" y="44" width="9" height="6" fill="#E88E96" />
        </g>
      ) : (
        // objeto lejano: horizonte con una ventana al fondo
        <g transform="translate(190 14)">
          <rect x="0" y="4" width="26" height="30" rx="2" fill="none" stroke="#7FE7DC" strokeWidth="2" />
          <path d="M13 4 V34 M0 19 H26" stroke="#7FE7DC" strokeWidth="1.4" opacity="0.7" />
        </g>
      )}
      {/* la distancia va debajo de todo el diagrama, sin chocar con el objeto */}
      <text
        x="120"
        y="80"
        fill="#7FE7DC"
        fontSize="12"
        fontWeight="700"
        textAnchor="middle"
        opacity="0.85"
      >
        {cerca ? "20 centímetros" : "6 metros"}
      </text>
    </svg>
  );
}

export function Regla202020Anim() {
  const t = useSegundos();
  const fase: "prep" | "lejos" | "cerca" | "fin" =
    t < 5 ? "prep" : t < 25 ? "lejos" : t < 45 ? "cerca" : "fin";
  const C = 2 * Math.PI * 44;

  // Sonido: sin mirar la pantalla, el cambio de fase se oye.
  useSenalDeFase(
    fase,
    fase === "lejos" ? "lejos" : fase === "cerca" ? "cerca" : fase === "fin" ? "fin" : null
  );

  const oscura = fase === "lejos" || fase === "cerca";
  const restante = fase === "lejos" ? 25 - t : 45 - t;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ minHeight: 290 }}>
      {/* la pantalla se APAGA de verdad: nada que mirar aquí */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: oscura ? 1 : 0 }}
        transition={{ duration: 1 }}
        style={{
          background:
            fase === "cerca"
              ? "radial-gradient(ellipse at 50% 45%, #0E2A2C 0%, #061618 70%)"
              : "radial-gradient(ellipse at 50% 40%, #101D2C 0%, #070E18 70%)",
        }}
      />
      <motion.div
        className="absolute inset-0 bg-mist-tint"
        animate={{ opacity: oscura ? 0 : 1 }}
        transition={{ duration: 1 }}
      />
      <div className="relative z-10 flex min-h-[290px] flex-col items-center justify-center gap-4 p-5">
        {fase === "prep" && (
          <motion.div
            key="prep"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="text-lg font-bold">Prepara tus dos puntos</p>
            <p className="mt-1 text-sm text-ink/60">
              Uno lejano a 6 metros (una ventana o el fondo de la habitación)
              y uno cercano a 20 centímetros (tu dedo o un lápiz). Ambos bien
              iluminados.
            </p>
            <p className="mt-4 text-6xl font-bold tabular-nums text-brand-tealDark">
              {5 - t}
            </p>
          </motion.div>
        )}
        {oscura && (
          <motion.div
            key={fase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 text-white"
          >
            <div className="relative">
              <svg width="150" height="150" viewBox="0 0 100 100" className="-rotate-90">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#ffffff1f" strokeWidth="7" />
                <motion.circle
                  key={fase}
                  cx="50" cy="50" r="44" fill="none"
                  stroke="#F79A56" strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={C}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: C }}
                  transition={{ duration: 20, ease: "linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold tabular-nums">
                {restante}
              </div>
            </div>
            <p className="text-lg font-bold">
              {fase === "lejos"
                ? "Fase 1 · Mira tu punto lejano"
                : "Fase 2 · Mira tu punto cercano"}
            </p>
            {/* El diagrama explica la distancia de un vistazo y se atenúa:
               es una indicación, no algo para quedarse mirando. */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0.35] }}
              transition={{ duration: 6, times: [0, 0.12, 0.6, 1] }}
            >
              <DiagramaDistancia cerca={fase === "cerca"} />
            </motion.div>
            <p className="text-xs text-white/55">
              {fase === "lejos"
                ? "Aparta la vista de la pantalla · el conteo se ve de reojo"
                : "Enfoca el objeto cercano sin forzar · falta poco"}
            </p>
          </motion.div>
        )}
        {fase === "fin" && (
          <motion.div
            key="fin"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="text-lg font-bold">Listo — parpadea suavemente un par de veces</p>
            <p className="mt-1 text-sm text-ink/60">
              Marca la pausa como cumplida.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ---------- 3. Ocho horizontal (∞) ----------
 * Velocidad LINEAL constante mediante tabla de longitud de arco.
 * 30 s en un sentido → descanso 10 s → 30 s en sentido contrario. */
export function OchoAnim() {
  const boxRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const sFrac = useRef(0);
  const fase = useRef<"ida" | "pausa" | "vuelta">("ida");
  const enFase = useRef(0);
  const [caption, setCaption] = useState<"ida" | "pausa" | "vuelta">("ida");

  // Tabla de longitud de arco de la lemniscata (relación de aspecto ~0.55)
  const LUT = useMemo(() => {
    const N = 720;
    const xs: number[] = [];
    const ys: number[] = [];
    const cum: number[] = [0];
    for (let i = 0; i <= N; i++) {
      const th = (i / N) * Math.PI * 2;
      xs.push(0.4 * Math.sin(th));
      ys.push(0.38 * 0.55 * Math.sin(2 * th));
      if (i > 0) {
        cum.push(cum[i - 1] + Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]));
      }
    }
    return { N, cum, total: cum[N] };
  }, []);

  // fracción de recorrido (0-1) → ángulo de la curva, interpolado
  function thetaDe(frac: number) {
    const objetivo = ((frac % 1) + 1) % 1 * LUT.total;
    let lo = 0, hi = LUT.N;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (LUT.cum[mid] < objetivo) lo = mid + 1;
      else hi = mid;
    }
    const i = Math.max(1, lo);
    const seg = LUT.cum[i] - LUT.cum[i - 1] || 1;
    const f = (objetivo - LUT.cum[i - 1]) / seg;
    return ((i - 1 + f) / LUT.N) * Math.PI * 2;
  }

  useAnimationFrame((_, delta) => {
    const box = boxRef.current;
    const dot = dotRef.current;
    if (!box || !dot) return;
    const dt = Math.min(delta, 64) / 1000;
    enFase.current += dt;

    if (fase.current === "ida" && enFase.current >= 30) {
      fase.current = "pausa";
      enFase.current = 0;
      setCaption("pausa");
    } else if (fase.current === "pausa" && enFase.current >= 10) {
      fase.current = "vuelta";
      enFase.current = 0;
      setCaption("vuelta");
    } else if (fase.current === "vuelta" && enFase.current >= 30) {
      fase.current = "ida";
      enFase.current = 0;
      setCaption("ida");
    }

    if (fase.current !== "pausa") {
      const dir = fase.current === "ida" ? 1 : -1;
      sFrac.current += (dir * dt) / 6; // una vuelta completa cada 6 s, velocidad constante
    }
    const th = thetaDe(sFrac.current);
    const w = box.clientWidth;
    const h = box.clientHeight;
    const x = w / 2 + w * 0.4 * Math.sin(th);
    const y = h / 2 + h * 0.38 * Math.sin(2 * th);
    dot.style.transform = `translate(${x - 12}px, ${y - 12}px)`;
  });

  // Sonido: al entrar al descanso avisa que cierre los ojos, al salir que los
  // abra, y marca el cambio de sentido.
  useSenalDeFase(
    caption,
    caption === "pausa" ? "cerrar" : caption === "vuelta" ? "abrir" : "cambio"
  );

  const puntos = useMemo(() => {
    const pts: string[] = [];
    for (let th = 0; th <= Math.PI * 2 + 0.001; th += 0.04) {
      pts.push(`${(50 + 40 * Math.sin(th)).toFixed(2)},${(30 + 22.8 * Math.sin(2 * th)).toFixed(2)}`);
    }
    return pts.join(" ");
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        ref={boxRef}
        className="relative h-64 w-full overflow-hidden rounded-2xl"
        style={{ background: "linear-gradient(160deg, #0B3A3C 0%, #06282A 60%, #052022 100%)" }}
      >
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden>
          <polyline
            points={puntos}
            fill="none"
            stroke="#40BFC0"
            strokeOpacity="0.35"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div ref={dotRef} className="absolute left-0 top-0 will-change-transform">
          <motion.div
            style={DOT_STYLE}
            animate={caption === "pausa" ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={caption === "pausa" ? { duration: 2, repeat: Infinity } : { duration: 0.3 }}
          />
        </div>
        {caption === "pausa" && (
          <div className="absolute inset-x-0 top-4 text-center">
            <span className="rounded-full bg-brand-orange px-4 py-1.5 text-sm font-bold text-[#0E2A47]">
              Descansa 10 s · cierra los ojos un momento
            </span>
          </div>
        )}
      </div>
      <p className="text-center text-sm font-medium">
        Cabeza quieta: sigue el punto naranja solo con los ojos
        {caption !== "pausa" && <> · <b>{caption === "ida" ? "sentido →" : "sentido ←"}</b></>}
      </p>
    </div>
  );
}

/* ---------- 4. Enfoque cercano-lejano ----------
 * Tus ojos van al dedo (15 cm) o al objeto lejano — NO a la pantalla.
 * La pantalla es el metrónomo: conteo gigante legible de reojo. */
export function EnfoqueAnim() {
  const t = useSegundos();
  const enCiclo = t % 20;
  const cerca = enCiclo < 10;
  const restante = cerca ? 10 - enCiclo : 20 - enCiclo;
  const ciclo = Math.min(Math.floor(t / 20) + 1, 10);

  // Sonido: dos tonos distintos para saber a dónde mirar sin ver la pantalla.
  // Suena también al empezar, porque la primera indicación es "enfoca cerca".
  useSenalDeFase(`${ciclo}-${cerca}`, cerca ? "cerca" : "lejos", true);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <motion.div
        className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-2xl transition-colors duration-1000"
        animate={{
          backgroundColor: cerca ? "rgba(247,154,86,0.14)" : "rgba(46,196,182,0.14)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={cerca ? "c" : "l"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xl font-bold sm:text-2xl"
          >
            {cerca ? "CERCA — enfoca tu dedo (15 centímetros)" : "LEJOS — objeto a 6 metros"}
          </motion.p>
        </AnimatePresence>
        {/* conteo gigante: legible con visión periférica */}
        <p
          className={`font-mono text-8xl font-bold tabular-nums ${
            cerca
              ? "text-[#C05E14]"
              : "text-brand-tealDark"
          }`}
        >
          {restante}
        </p>
        {/* pacer periférico: crece cerca, se encoge lejos */}
        <motion.div
          animate={{ width: cerca ? 72 : 20, height: cerca ? 72 : 20, opacity: cerca ? 1 : 0.7 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          style={{
            borderRadius: "50%",
            background: "#F79A56",
            boxShadow: "0 0 0 2px rgba(255,255,255,0.5), 0 0 20px rgba(247,154,86,0.7)",
          }}
        />
      </motion.div>
      <p className="text-sm text-ink/60">
        Ciclo {ciclo} / 10 · no mires fijo la pantalla: el conteo es tu metrónomo
      </p>
    </div>
  );
}

/* ---------- Rostro + manos SVG compartidos (5 y 6) ----------
 * Una cara con ojos cerrados y dos manos reconocibles (palma + dedos +
 * pulgar). La guía MUESTRA el gesto: frotar las palmas abajo y luego
 * subirlas hasta cubrir los ojos. */
function Mano({ espejo }: { espejo?: boolean }) {
  // Mano con dedos, apuntando hacia arriba; origen en (0,0)-(46,78)
  return (
    <g transform={espejo ? "scale(-1,1) translate(-46,0)" : undefined}>
      {/* dedos */}
      <g fill="#F1BC93" stroke="#B96A32" strokeWidth="2.5">
        <rect x="2" y="12" width="9" height="30" rx="4.5" />
        <rect x="12.5" y="5" width="9" height="36" rx="4.5" />
        <rect x="23" y="3" width="9" height="38" rx="4.5" />
        <rect x="33.5" y="9" width="9" height="32" rx="4.5" />
        {/* palma */}
        <rect x="1" y="34" width="43" height="42" rx="14" />
        {/* pulgar */}
        <rect x="38" y="42" width="22" height="11" rx="5.5" transform="rotate(38 38 42)" />
      </g>
    </g>
  );
}

function ManoPosicionada({
  espejo,
  transform,
  oscila,
}: {
  espejo?: boolean;
  transform: string;
  oscila?: string; // valores del vaivén de frote, p. ej. "0 0;16 0;0 0"
}) {
  // Posición por fase con transform CSS (transiciona suave entre fases);
  // el vaivén continuo del frote usa animateTransform nativo de SVG.
  return (
    <g
      style={{
        transform,
        transition: "transform 1.4s ease-in-out",
        transformBox: "fill-box",
        transformOrigin: "center",
      }}
    >
      <g>
        {oscila && (
          <animateTransform
            attributeName="transform"
            type="translate"
            values={oscila}
            dur="1.1s"
            repeatCount="indefinite"
          />
        )}
        <Mano espejo={espejo} />
      </g>
    </g>
  );
}

function ManosGuia({ fase }: { fase: "frotar" | "colocar" }) {
  const frotar = fase === "frotar";
  return (
    <svg width="300" height="190" viewBox="0 0 300 190" aria-hidden>
      {/* rostro centrado, con ojos cerrados, pestañitas y mejillas */}
      <g>
        <ellipse cx="150" cy="88" rx="58" ry="62" fill="#FDE9D6" stroke="#14344A" strokeWidth="3.5" />
        {/* mejillas */}
        <circle cx="116" cy="104" r="8" fill="#F6B8A0" opacity="0.55" />
        <circle cx="184" cy="104" r="8" fill="#F6B8A0" opacity="0.55" />
        <g stroke="#14344A" strokeWidth="4" strokeLinecap="round" fill="none">
          {/* ojos cerrados (párpados relajados) */}
          <path d="M116 82 Q128 92 140 82" />
          <path d="M160 82 Q172 92 184 82" />
          {/* cejas */}
          <path d="M114 66 Q128 60 142 66" opacity="0.6" />
          <path d="M158 66 Q172 60 186 66" opacity="0.6" />
          {/* boca serena */}
          <path d="M140 122 Q150 129 160 122" opacity="0.75" />
        </g>
        {/* pestañitas */}
        <g stroke="#14344A" strokeWidth="2.5" strokeLinecap="round" opacity="0.7">
          <path d="M120 88 L116 95 M128 90 L128 97 M136 88 L140 95" />
          <path d="M164 88 L160 95 M172 90 L172 97 M180 88 L184 95" />
        </g>
      </g>

      {/* calor al frotar (junto a las manos, sin tapar el rostro) */}
      {frotar && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="stroke-brand-orange"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        >
          <path d="M228 92 q4 -8 0 -16" />
          <path d="M240 96 q4 -8 0 -16" />
          <path d="M252 92 q4 -8 0 -16" />
        </motion.g>
      )}

      {/* mano izquierda: frota al costado y luego cubre el ojo izquierdo */}
      <ManoPosicionada
        transform={
          frotar
            ? "translate(204px, 106px) rotate(8deg)"
            : "translate(106px, 34px) rotate(8deg)"
        }
        oscila={frotar ? "0 0;12 0;0 0" : undefined}
      />
      {/* mano derecha (espejo): cubre el ojo derecho */}
      <ManoPosicionada
        espejo
        transform={
          frotar
            ? "translate(236px, 110px) rotate(-8deg)"
            : "translate(152px, 34px) rotate(-8deg)"
        }
        oscila={frotar ? "0 0;-12 0;0 0" : undefined}
      />
    </svg>
  );
}

/* ---------- 5. Masaje palpebral con calor ----------
 * 0-10 s: frota las manos (animado) → 10-40 s: palmas sobre los párpados
 * con marcapasos de respiración. */
export function MasajeAnim() {
  const t = useSegundos();
  const fase: "frotar" | "colocar" = t < 10 ? "frotar" : "colocar";
  const terminando = t >= 39; // el ejercicio dura 40 s
  // La respiración se cuenta desde que empiezan las palmas sobre los ojos,
  // así el primer aviso es siempre "inhala" (y texto y sonido comparten
  // la misma variable: no pueden desincronizarse).
  // Un segundo de margen tras el aviso de tapar los ojos, para que los dos
  // sonidos no se pisen.
  const enColocar = Math.max(0, t - 11);
  const inhala = enColocar % 8 < 4;
  const respirando = fase === "colocar" && t >= 11 && !terminando;

  // Sonido: aviso al tapar los ojos, ritmo de respiración y aviso de apertura.
  useSenalDeFase(
    terminando ? "fin" : fase,
    terminando ? "abrir" : fase === "colocar" ? "cerrar" : null
  );
  useSenalDeFase(
    respirando ? Math.floor(enColocar / 4) : "-",
    respirando ? (inhala ? "inhalar" : "exhalar") : null
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100">
        {/* la escena respira con el mismo reloj que el texto de inhala/exhala */}
        <div
          style={{
            transform: fase === "colocar" && inhala ? "scale(1.06)" : "scale(1)",
            transition: "transform 4s ease-in-out",
          }}
        >
          <ManosGuia fase={fase} />
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={fase === "frotar" ? "f" : inhala ? "i" : "e"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-lg font-bold"
        >
          {fase === "frotar"
            ? `Paso 1 · Frota tus manos hasta calentarlas… ${10 - t} s`
            : !respirando
              ? "Paso 2 · Coloca las palmas sobre los párpados cerrados"
              : inhala
                ? "Círculos suaves, sin presionar · Inhala profundo…"
                : "Círculos suaves, sin presionar · Exhala…"}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/* ---------- 6. Palming ----------
 * 0-5 s: guía de colocación → oscuridad casi total con respiración apenas
 * visible → salida calmada en los últimos segundos. */
export function PalmingAnim() {
  const t = useSegundos();
  const fase: "prep" | "oscuro" | "salida" = t < 5 ? "prep" : t < 54 ? "oscuro" : "salida";
  // Respiración contada desde que empieza la oscuridad: el primer aviso es
  // "inhala", y el círculo y el texto usan esta misma variable.
  // Un segundo de margen tras el aviso de cubrir los ojos.
  const enOscuro = Math.max(0, t - 6);
  const inhala = enOscuro % 8 < 4;

  // Sonido: con los ojos tapados, todo el ejercicio se guía por oído.
  useSenalDeFase(fase, fase === "oscuro" ? "cerrar" : fase === "salida" ? "abrir" : null);
  useSenalDeFase(
    fase === "oscuro" && t >= 6 ? Math.floor(enOscuro / 4) : "-",
    fase === "oscuro" && t >= 6 ? (inhala ? "inhalar" : "exhalar") : null
  );

  return (
    <motion.div
      animate={{
        backgroundColor:
          fase === "prep"
            ? "rgba(3,6,12,0)"
            : fase === "oscuro"
              ? "rgba(3,6,12,0.97)"
              : "rgba(16,30,52,0.55)",
      }}
      transition={{ duration: fase === "salida" ? 4 : 2.5, ease: "easeInOut" }}
      className="flex w-full flex-col items-center gap-5 rounded-2xl px-4 py-8"
    >
      {fase === "prep" ? (
        <>
          <ManosGuia fase="colocar" />
          <p className="text-lg font-bold">
            Cubre tus ojos con las palmas… {5 - t} s
          </p>
          <p className="text-sm text-ink/60">
            Sin presionar los globos oculares; bloquea toda la luz.
          </p>
        </>
      ) : (
        <>
          {/* el círculo respira con el MISMO reloj que el texto: crece los
             4 s de inhalar y se encoge los 4 s de exhalar */}
          <div
            className="h-28 w-28 rounded-full bg-[#123657] shadow-[0_0_60px_rgba(30,84,134,0.5)]"
            style={{
              transform: inhala ? "scale(1.6)" : "scale(1)",
              opacity: fase === "salida" ? 0.6 : 0.32,
              transition: "transform 4s ease-in-out, opacity 2s ease",
            }}
          />
          <AnimatePresence mode="wait">
            <motion.p
              key={fase === "salida" ? "s" : inhala ? "i" : "e"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-lg font-bold text-slate-300"
            >
              {fase === "salida"
                ? "Retira las manos lentamente y abre los ojos…"
                : inhala
                  ? "Inhala… el círculo crece"
                  : "Exhala… el círculo se encoge"}
            </motion.p>
          </AnimatePresence>
          <p className="max-w-xs text-center text-sm text-slate-500">
            Oscuridad total · respira lento y profundo
          </p>
        </>
      )}
    </motion.div>
  );
}

/* ---------- 7. Push up pencil ----------
 * Corrección de la clienta: NO es seguir el lápiz hacia los extremos. Es
 * acercarlo al centro de los ojos hasta verlo DOBLE y alejarlo hasta volver
 * a ver uno solo (ejercicio de convergencia). La guía imita esa vista: el
 * lápiz crece al acercarse y se desdobla en la zona de visión doble. */
export function PencilAnim() {
  const [t, setT] = useState(0); // décimas de segundo, para movimiento fluido
  useEffect(() => {
    const iv = window.setInterval(() => setT((x) => x + 1), 100);
    return () => window.clearInterval(iv);
  }, []);

  const CICLO = 120; // 12 s: acercar 5 s · zona doble 2 s · alejar 5 s
  const enCiclo = t % CICLO;
  const fase: "acercar" | "doble" | "alejar" =
    enCiclo < 50 ? "acercar" : enCiclo < 70 ? "doble" : "alejar";

  useSenalDeFase(
    fase,
    fase === "doble" ? "cambio" : fase === "alejar" ? "lejos" : "cerca",
    true // arranca indicando "acerca el lápiz"
  );

  // Proximidad 0 (brazo extendido) → 1 (cerca de la nariz)
  const prox =
    fase === "acercar"
      ? enCiclo / 50
      : fase === "doble"
        ? 1
        : Math.max(0, 1 - (enCiclo - 70) / 50);

  const escala = 0.55 + prox * 0.95;
  const separacion = fase === "doble" ? 26 : prox > 0.82 ? (prox - 0.82) * 90 : 0;
  const dobleVision = separacion > 1;

  const Lapiz = ({ dx, opacidad }: { dx: number; opacidad: number }) => (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        transform: `translate(calc(-50% + ${dx}px), -50%) scale(${escala})`,
        opacity: opacidad,
        transition: "transform 0.12s linear, opacity 0.25s ease",
      }}
    >
      <svg width="42" height="150" viewBox="0 0 42 150" aria-hidden>
        {/* punta */}
        <path d="M21 4 L33 34 H9 Z" fill="#F2C6A0" />
        <path d="M21 4 L26 16 H16 Z" fill="#2B2B2B" />
        {/* cuerpo */}
        <rect x="9" y="34" width="24" height="88" fill="#F79A56" />
        <rect x="9" y="34" width="7" height="88" fill="#E8823B" opacity="0.55" />
        {/* virola y goma */}
        <rect x="9" y="122" width="24" height="12" fill="#C9CDD2" />
        <rect x="9" y="134" width="24" height="14" rx="4" fill="#E88E96" />
      </svg>
    </div>
  );

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        className="relative h-64 w-full overflow-hidden rounded-2xl"
        style={{ background: "linear-gradient(160deg, #0B3A3C 0%, #06282A 60%, #052022 100%)" }}
      >
        {/* eje central: el lápiz viaja hacia el puente de la nariz */}
        <div className="absolute left-1/2 top-0 h-full w-px bg-marine-line/20" />

        {dobleVision ? (
          <>
            <Lapiz dx={-separacion} opacidad={0.75} />
            <Lapiz dx={separacion} opacidad={0.75} />
          </>
        ) : (
          <Lapiz dx={0} opacidad={1} />
        )}

        <div className="absolute inset-x-0 bottom-3 text-center">
          <span
            className={`rounded-full px-4 py-1.5 text-sm font-bold ${
              fase === "doble"
                ? "bg-brand-orange text-[#0E2A47]"
                : "bg-marine-line/15 text-marine-line"
            }`}
          >
            {fase === "acercar"
              ? "Acerca el lápiz al centro de tus ojos"
              : fase === "doble"
                ? "¿Lo ves doble? Detente ahí"
                : "Aléjalo hasta ver un solo lápiz"}
          </span>
        </div>
      </div>
      <p className="text-center text-sm font-medium">
        Sostén tu lápiz a la altura de los ojos y muévelo <b>en línea recta</b>{" "}
        hacia el puente de la nariz, siguiéndolo con la mirada.
      </p>
    </div>
  );
}

export const ANIMACIONES: Record<string, () => JSX.Element> = {
  "parpadeo-consciente": ParpadeoAnim,
  "regla-20-20-20": Regla202020Anim,
  "ocho-horizontal": OchoAnim,
  "enfoque-cercano-lejano": EnfoqueAnim,
  "masaje-palpebral": MasajeAnim,
  palming: PalmingAnim,
  "push-up-pencil": PencilAnim,
};
