// Cuestionario CVS-Q: 16 síntomas de fatiga visual digital.
export const SINTOMAS: string[] = [
  "Ardor en los ojos",
  "Picor ocular",
  "Sensación de cuerpo extraño",
  "Lagrimeo",
  "Parpadeo excesivo",
  "Enrojecimiento ocular",
  "Dolor ocular",
  "Pesadez de párpados",
  "Sequedad ocular",
  "Visión borrosa",
  "Visión doble",
  "Dificultad para enfocar de cerca",
  "Aumento de la sensibilidad a la luz",
  "Halos de colores alrededor de los objetos",
  "Sensación de ver peor",
  "Dolor de cabeza",
];

export type Respuesta = {
  frecuencia: 0 | 1 | 2 | null; // Nunca / Ocasionalmente / A menudo o siempre
  intensidad: 1 | 2; // Moderada / Intensa (duplica el ítem)
};

export const FRECUENCIAS = ["Nunca", "Ocasionalmente", "A menudo o siempre"] as const;
export const INTENSIDADES = ["Moderada", "Intensa"] as const;

// Puntuación de demostración: frecuencia (0/1/2) × intensidad (1/2).
export function calcularPuntaje(respuestas: Respuesta[]): number {
  return respuestas.reduce((total, r) => {
    if (!r.frecuencia) return total;
    return total + r.frecuencia * r.intensidad;
  }, 0);
}

export const UMBRAL = 6;
export const PUNTAJE_MAXIMO = SINTOMAS.length * 2 * 2; // 64
