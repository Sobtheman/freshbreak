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

// Recomendación de intervalo entre pausas según CVS-Q y exposición a pantallas
// (la propuesta pide personalizar frecuencia según síntomas y carga visual).
export function recomendarIntervalo(score: number | null, horasPantalla: number): number {
  const s = score ?? 0;
  if (s >= 12 || horasPantalla >= 8) return 20;
  if (s >= 6 || horasPantalla >= 6) return 30;
  return 60;
}

export function razonIntervalo(score: number | null, horasPantalla: number): string {
  const s = score ?? 0;
  if (s >= 12 || horasPantalla >= 8)
    return "Tu puntaje CVS-Q y tu alta exposición a pantallas indican pausas frecuentes.";
  if (s >= 6 || horasPantalla >= 6)
    return "Presentas síntomas de fatiga visual: te conviene descansar más seguido.";
  return "Tu nivel de fatiga es bajo: el estándar de 60 minutos es suficiente.";
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
      while (t <= b.fin * 60) {
        horas.push(
          `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`
        );
        t += intervaloMin;
      }
    });
  return horas;
}

// Día de la semana con Lunes = 0 (JS usa Domingo = 0).
export function hoyIndice(): number {
  return (new Date().getDay() + 6) % 7;
}
