// Horario académico del usuario: bloques de estudio semanales que determinan
// cuándo se programan los recordatorios (según la propuesta: "horarios académicos"
// y "carga visual diaria registrada").

export type Bloque = {
  dia: number; // 0 = Lunes … 6 = Domingo
  inicio: number; // hora 0-23
  fin: number; // hora 1-24
};

export const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const DIAS_CORTO = ["L", "M", "X", "J", "V", "S", "D"];

export const BLOQUES_EJEMPLO: Bloque[] = [
  { dia: 0, inicio: 8, fin: 12 },
  { dia: 0, inicio: 14, fin: 18 },
  { dia: 1, inicio: 8, fin: 12 },
  { dia: 2, inicio: 8, fin: 12 },
  { dia: 2, inicio: 14, fin: 18 },
  { dia: 3, inicio: 10, fin: 13 },
  { dia: 4, inicio: 8, fin: 12 },
];

// Recomendación de intervalo entre pausas. La propuesta fija el estándar en
// 60 minutos y pide personalizar la frecuencia según síntomas y carga visual:
// con síntomas (CVS-Q ≥ 6) o alta exposición (≥ 8 h/día) se acorta a 45 min.
// (La regla 20-20-20 es un EJERCICIO de micro-descanso, no la cadencia de
// los recordatorios.)
export function recomendarIntervalo(score: number | null, horasPantalla: number): number {
  const s = score ?? 0;
  if (s >= 6 || horasPantalla >= 8) return 45;
  return 60;
}

export function razonIntervalo(score: number | null, horasPantalla: number): string {
  const s = score ?? 0;
  if (s >= 6 || horasPantalla >= 8)
    return "Presentas síntomas de fatiga visual o alta exposición: acortamos el estándar de 60 a 45 minutos.";
  return "Tu nivel de fatiga es bajo: el estándar de 60 minutos de la propuesta es suficiente.";
}

// Horas de pausa programadas para un día dado ("HH:MM"), cada `intervaloMin`
// dentro de cada bloque de estudio.
export function pausasDelDia(bloques: Bloque[], dia: number, intervaloMin: number): string[] {
  const horas: string[] = [];
  bloques
    .filter((b) => b.dia === dia)
    .sort((a, b) => a.inicio - b.inicio)
    .forEach((b) => {
      let t = b.inicio * 60 + intervaloMin;
      // estrictamente DENTRO del bloque: sin recordatorios al minuto de salida
      while (t < b.fin * 60) {
        horas.push(
          `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`
        );
        t += intervaloMin;
      }
    });
  return horas;
}

// Presentación de horas en formato de 12 horas con a. m. / p. m., que es
// como se leen las horas en Colombia (internamente todo sigue en 24 h).
export function hora12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  return `${((h % 12) || 12)}:${String(m).padStart(2, "0")} ${h % 24 < 12 ? "a. m." : "p. m."}`;
}

// Hora en punto: 8 → "8 a. m." · 14 → "2 p. m." · 24 → "12 a. m."
export function horaEntera12(h: number): string {
  return `${((h % 12) || 12)} ${h % 24 < 12 ? "a. m." : "p. m."}`;
}

// Día de la semana con Lunes = 0 (JS usa Domingo = 0).
export function hoyIndice(): number {
  return (new Date().getDay() + 6) % 7;
}
