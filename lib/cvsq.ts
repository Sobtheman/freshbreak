// Cuestionario CVS-Q según Anexo 1 de la propuesta: 16 preguntas numeradas,
// donde las preguntas 2, 4 y 7 son las intensidades de la 1, la 3 y la 6.
export type PreguntaCVSQ = {
  num: number;
  texto: string;
  intensidad?: { num: number; texto: string };
};

export const PREGUNTAS: PreguntaCVSQ[] = [
  {
    num: 1,
    texto:
      "¿Con qué frecuencia presenta visión borrosa durante o después de usar dispositivos electrónicos (como computadora, tablet o celular)?",
    intensidad: {
      num: 2,
      texto: "¿Qué intensidad tiene la visión borrosa cuando se presenta?",
    },
  },
  {
    num: 3,
    texto:
      "¿Con qué frecuencia tiene dificultad para enfocar objetos cercanos durante o después del uso de pantallas?",
    intensidad: {
      num: 4,
      texto: "¿Qué intensidad tiene esta dificultad para enfocar cuando se presenta?",
    },
  },
  {
    num: 5,
    texto:
      "¿Con qué frecuencia nota aumento en la sensibilidad a la luz durante o después del uso de pantallas digitales?",
  },
  {
    num: 6,
    texto:
      "¿Con qué frecuencia experimenta dolor de cabeza durante o después del uso de dispositivos digitales?",
    intensidad: {
      num: 7,
      texto: "¿Qué intensidad tiene el dolor de cabeza cuando se presenta?",
    },
  },
  {
    num: 8,
    texto: "¿Con qué frecuencia siente ardor en los ojos al usar pantallas digitales?",
  },
  {
    num: 9,
    texto:
      "¿Con qué frecuencia presenta sensación de cuerpo extraño (como si tuviera algo en el ojo) al usar dispositivos digitales?",
  },
  {
    num: 10,
    texto:
      "¿Con qué frecuencia presenta lagrimeo excesivo durante o después del uso de pantallas?",
  },
  {
    num: 11,
    texto:
      "¿Con qué frecuencia siente sequedad ocular mientras usa o después de usar pantallas digitales?",
  },
  {
    num: 12,
    texto:
      "¿Con qué frecuencia experimenta enrojecimiento ocular al usar dispositivos digitales?",
  },
  {
    num: 13,
    texto:
      "¿Con qué frecuencia presenta visión borrosa al mirar de lejos después de usar pantallas por tiempo prolongado?",
  },
  {
    num: 14,
    texto:
      "¿Con qué frecuencia percibe cansancio ocular o fatiga visual al usar dispositivos digitales?",
  },
  {
    num: 15,
    texto:
      "¿Con qué frecuencia presenta dolor o tensión en cuello, hombros o espalda asociado al uso de pantallas?",
  },
  {
    num: 16,
    texto:
      "¿Con qué frecuencia interrumpe sus actividades por molestias visuales al usar dispositivos electrónicos?",
  },
];

export type Respuesta = {
  frecuencia: 0 | 1 | 2 | null; // Nunca / Ocasionalmente / A menudo o siempre
  intensidad: 1 | 2; // Moderada / Intensa (solo preguntas con intensidad)
};

export const FRECUENCIAS = ["Nunca", "Ocasionalmente", "A menudo o siempre"] as const;
export const INTENSIDADES = ["Moderada", "Intensa"] as const;

// Puntuación de demostración: frecuencia (0/1/2); "Intensa" duplica el ítem
// en las preguntas que tienen sub-pregunta de intensidad (1, 3 y 6).
export function calcularPuntaje(respuestas: Respuesta[]): number {
  return respuestas.reduce((total, r, i) => {
    if (!r.frecuencia) return total;
    const factor = PREGUNTAS[i].intensidad ? r.intensidad : 1;
    return total + r.frecuencia * factor;
  }, 0);
}

export const UMBRAL = 6;
// 3 preguntas con intensidad (máx 2×2=4) + 10 solo frecuencia (máx 2) = 32
export const PUNTAJE_MAXIMO = 32;
