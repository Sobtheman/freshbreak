"use client";

import { useCallback, useEffect, useState } from "react";

// Señales sonoras de los ejercicios. Varios se hacen con los ojos cerrados o
// mirando lejos de la pantalla, así que la guía visual no basta: el sonido
// avisa cuándo abrir los ojos, cuándo cambiar el enfoque y cuándo respirar.
//
// Los tonos se generan con Web Audio API (sin archivos de audio). El
// navegador bloquea el sonido hasta que hay un gesto del usuario, así que el
// contexto se crea de forma perezosa en el primer toque y, si sigue
// bloqueado cuando toca una señal, simplemente se omite.

export type Senal =
  | "abrir"
  | "cerrar"
  | "cambio"
  | "cerca"
  | "lejos"
  | "inhalar"
  | "exhalar"
  | "fin";

const CLAVE = "fb-sonido";

let ctx: AudioContext | null = null;
let gestoRegistrado = false;

function crearContexto(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC();
  } catch {
    return null;
  }
  return ctx;
}

// Cualquier gesto del usuario desbloquea el audio del navegador.
function registrarGesto() {
  if (gestoRegistrado || typeof window === "undefined") return;
  gestoRegistrado = true;
  const desbloquear = () => {
    const c = crearContexto();
    if (c && c.state === "suspended") c.resume().catch(() => {});
  };
  window.addEventListener("pointerdown", desbloquear, { passive: true });
  window.addEventListener("keydown", desbloquear, { passive: true });
}

// Una nota simple con envolvente suave (sin clics ni golpes secos).
function nota(
  c: AudioContext,
  frecuencia: number,
  inicio: number,
  duracion: number,
  volumen = 0.16
) {
  const osc = c.createOscillator();
  const gan = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(frecuencia, inicio);
  gan.gain.setValueAtTime(0.0001, inicio);
  gan.gain.exponentialRampToValueAtTime(volumen, inicio + 0.015);
  gan.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);
  osc.connect(gan);
  gan.connect(c.destination);
  osc.start(inicio);
  osc.stop(inicio + duracion + 0.02);
}

// Barrido continuo: sirve para "inhala" (sube) y "exhala" (baja).
function barrido(
  c: AudioContext,
  desde: number,
  hasta: number,
  inicio: number,
  duracion: number,
  volumen = 0.1
) {
  const osc = c.createOscillator();
  const gan = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(desde, inicio);
  osc.frequency.linearRampToValueAtTime(hasta, inicio + duracion);
  gan.gain.setValueAtTime(0.0001, inicio);
  gan.gain.exponentialRampToValueAtTime(volumen, inicio + 0.12);
  gan.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);
  osc.connect(gan);
  gan.connect(c.destination);
  osc.start(inicio);
  osc.stop(inicio + duracion + 0.02);
}

export function reproducir(senal: Senal) {
  const c = crearContexto();
  if (!c || c.state !== "running") {
    // Sin gesto previo del navegador: se intenta reanudar y se omite el tono.
    c?.resume().catch(() => {});
    return;
  }
  const t = c.currentTime;
  switch (senal) {
    case "abrir": // dos tonos ascendentes: "ya puedes abrir los ojos"
      nota(c, 660, t, 0.16);
      nota(c, 990, t + 0.14, 0.22);
      break;
    case "cerrar": // tono descendente suave: "cierra los ojos"
      nota(c, 520, t, 0.18, 0.13);
      nota(c, 390, t + 0.16, 0.26, 0.13);
      break;
    case "cambio": // doble pulso corto y neutro
      nota(c, 780, t, 0.1);
      nota(c, 780, t + 0.16, 0.12);
      break;
    case "cerca": // grave = enfoque cercano
      nota(c, 440, t, 0.22);
      break;
    case "lejos": // agudo = enfoque lejano
      nota(c, 880, t, 0.22);
      break;
    case "inhalar":
      barrido(c, 420, 700, t, 1.1);
      break;
    case "exhalar":
      barrido(c, 700, 420, t, 1.3);
      break;
    case "fin": // acorde breve de cierre
      nota(c, 523, t, 0.3, 0.12);
      nota(c, 784, t + 0.02, 0.34, 0.1);
      break;
  }
}

// Preferencia compartida por toda la página: el botón vive en la tarjeta del
// ejercicio y las señales se disparan dentro de la animación, así que el
// estado se guarda a nivel de módulo y los componentes se suscriben.
let sonidoActivo = true;
const oyentes = new Set<(v: boolean) => void>();

function fijarActivo(v: boolean) {
  sonidoActivo = v;
  oyentes.forEach((f) => f(v));
}

export function useSonido() {
  const [activo, setActivo] = useState(sonidoActivo);

  useEffect(() => {
    registrarGesto();
    if (localStorage.getItem(CLAVE) === "off" && sonidoActivo) fijarActivo(false);
    setActivo(sonidoActivo);
    oyentes.add(setActivo);
    return () => {
      oyentes.delete(setActivo);
    };
  }, []);

  const alternar = useCallback(() => {
    const nuevo = !sonidoActivo;
    localStorage.setItem(CLAVE, nuevo ? "on" : "off");
    fijarActivo(nuevo);
    // El clic del botón es el gesto que desbloquea el audio del navegador.
    if (nuevo) {
      const c = crearContexto();
      c?.resume()
        .then(() => reproducir("cambio"))
        .catch(() => {});
    }
  }, []);

  const sonar = useCallback((senal: Senal) => {
    if (sonidoActivo) reproducir(senal);
  }, []);

  return { activo, alternar, sonar };
}
