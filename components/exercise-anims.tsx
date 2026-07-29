"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationFrame } from "framer-motion";

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
              <p className="text-2xl font-bold tabular-nums">
                Parpadeo {rep} / 10 ·{" "}
                <span className={cerrado ? "text-brand-tealDark" : "text-[#C05E14]"}>
                  {cerrado ? "cierra…" : "abre"}
                </span>
              </p>
              <p className="text-sm text-ink/60">
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
 * 5 s de preparación con la pantalla encendida → 20 s con la pantalla
 * atenuada (horizonte lejano + anillo) → cierre. */
export function Regla202020Anim() {
  const t = useSegundos();
  const fase: "prep" | "lejos" | "fin" = t < 5 ? "prep" : t < 25 ? "lejos" : "fin";
  const C = 2 * Math.PI * 44;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ minHeight: 290 }}>
      {/* la pantalla se APAGA de verdad: nada que mirar aquí, solo un
         conteo gigante legible de reojo mientras la mirada está a 6 m */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: fase === "lejos" ? 1 : 0 }}
        transition={{ duration: 1.2 }}
        style={{ background: "radial-gradient(ellipse at 50% 40%, #101D2C 0%, #070E18 70%)" }}
      />
      <motion.div
        className="absolute inset-0 bg-mist-tint"
        animate={{ opacity: fase === "lejos" ? 0 : 1 }}
        transition={{ duration: 1.2 }}
      />
      <div className="relative z-10 flex min-h-[290px] flex-col items-center justify-center gap-4 p-5">
        {fase === "prep" && (
          <motion.div
            key="prep"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="text-lg font-bold">Elige tu punto lejano</p>
            <p className="mt-1 text-sm text-ink/60">
              Una ventana o el punto más lejano de la habitación (6 m), bien
              iluminado. Gira la silla si hace falta.
            </p>
            <p className="mt-4 text-6xl font-bold tabular-nums text-brand-tealDark">
              {5 - t}
            </p>
          </motion.div>
        )}
        {fase === "lejos" && (
          <motion.div
            key="lejos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 text-white"
          >
            <div className="relative">
              <svg width="150" height="150" viewBox="0 0 100 100" className="-rotate-90">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#ffffff1f" strokeWidth="7" />
                <motion.circle
                  cx="50" cy="50" r="44" fill="none"
                  stroke="#F79A56" strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={C}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: C }}
                  transition={{ duration: 20, ease: "linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold tabular-nums">
                {25 - t}
              </div>
            </div>
            <p className="text-lg font-bold">Aparta la vista de la pantalla</p>
            <p className="text-xs text-white/55">
              Sostén la mirada en tu punto lejano · el conteo se ve de reojo
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
            {cerca ? "CERCA — enfoca tu dedo (15 cm)" : "LEJOS — objeto a 6 m"}
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
  const inhala = t % 8 < 4;

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
            : inhala
              ? "Paso 2 · Palmas sobre los párpados · Inhala profundo…"
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
  const inhala = t % 8 < 4;

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
 * El punto hace de lápiz: horizontal 30 s → vertical 30 s, velocidad constante. */
export function PencilAnim() {
  const boxRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const t = useRef(0);
  const elapsed = useRef(0);
  const [eje, setEje] = useState<"x" | "y">("x");

  useAnimationFrame((_, delta) => {
    const box = boxRef.current;
    const dot = dotRef.current;
    if (!box || !dot) return;
    const dt = Math.min(delta, 64) / 1000;
    elapsed.current += dt;
    if (eje === "x" && elapsed.current >= 30) {
      setEje("y");
      t.current = 0;
    }
    t.current += dt * ((Math.PI * 2) / 8);
    const tri = (2 / Math.PI) * Math.asin(Math.sin(t.current));
    const w = box.clientWidth;
    const h = box.clientHeight;
    const hx = w / 2 - 16;
    const hy = h / 2 - 16;
    const x = w / 2 + (eje === "x" ? tri * hx : 0);
    const y = h / 2 + (eje === "y" ? tri * hy : 0);
    dot.style.transform = `translate(${x - 12}px, ${y - 12}px)`;
  });

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        ref={boxRef}
        className="relative h-64 w-full overflow-hidden rounded-2xl"
        style={{ background: "linear-gradient(160deg, #0B3A3C 0%, #06282A 60%, #052022 100%)" }}
      >
        {/* guías tenues de los dos ejes del recorrido */}
        <div className="absolute left-0 top-1/2 h-px w-full bg-marine-line/20" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-marine-line/20" />
        <div ref={dotRef} className="absolute left-0 top-0" style={DOT_STYLE} />
      </div>
      <p className="text-center text-sm font-medium">
        El punto hace de lápiz: síguelo sin mover la cabeza ·{" "}
        <b>{eje === "x" ? "izquierda ↔ derecha" : "arriba ↕ abajo"}</b>
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
