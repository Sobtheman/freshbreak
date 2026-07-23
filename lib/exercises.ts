export type Ejercicio = {
  id: string;
  nombre: string;
  emoji: string;
  objetivo: string;
  porQue: string;
  duracion: number; // segundos
  duracionLabel: string;
  pasos: string[]; // instrucciones textuales de la propuesta (acción real del usuario)
  guia: string; // qué hace la guía animada en pantalla
};

// Instrucciones y objetivos tomados textualmente de la propuesta.
export const EJERCICIOS: Ejercicio[] = [
  {
    id: "parpadeo-consciente",
    nombre: "Parpadeo consciente",
    emoji: "👁️",
    objetivo: "Lubricar naturalmente la superficie ocular.",
    porQue:
      "Frente a pantallas parpadeamos hasta un 60 % menos, lo que reseca la superficie del ojo.",
    duracion: 120,
    duracionLabel: "2 min",
    pasos: [
      "Siéntate recto y relájate.",
      "Cierra los ojos suavemente por 2 segundos y ábrelos.",
      "Repite este proceso 10 veces lentamente.",
      "Descansa 10 segundos.",
      "Hazlo durante 2 minutos.",
    ],
    guia: "El ojo en pantalla marca el ritmo: se cierra 2 segundos y se abre contigo.",
  },
  {
    id: "regla-20-20-20",
    nombre: "Regla 20-20-20",
    emoji: "⏱️",
    objetivo: "Relajar la acomodación ocular.",
    porQue:
      "Cada 20 minutos de pantalla, mirar 20 segundos a 20 pies (6 m) reduce la fatiga acomodativa.",
    duracion: 25,
    duracionLabel: "25 s · 5 s de preparación + 20 s",
    pasos: [
      "Cada 60 minutos, mira un objeto a 20 pies (6 metros) durante 20 segundos.",
      "Asegúrate de que el objeto esté bien iluminado.",
      "Puedes mirar por la ventana o enfocar un punto lejano en la habitación.",
    ],
    guia: "La pantalla se atenúa 20 segundos con un horizonte lejano: es tu señal para apartar la vista.",
  },
  {
    id: "ocho-horizontal",
    nombre: "Movimiento ocular en forma de ocho",
    emoji: "♾️",
    objetivo: "Estimular movilidad ocular.",
    porQue:
      "Los movimientos oculares amplios y controlados mejoran la coordinación y reducen la rigidez ocular.",
    duracion: 70,
    duracionLabel: "70 s · 30 s por sentido + descanso",
    pasos: [
      "Imagina un número ocho horizontal (∞) frente a ti.",
      "Con tus ojos, sin mover la cabeza, síguelo durante 30 segundos en una dirección y 30 segundos en la otra.",
      "Descansa 10 segundos.",
    ],
    guia: "El punto naranja recorre el ocho a velocidad constante; síguelo solo con la mirada.",
  },
  {
    id: "enfoque-cercano-lejano",
    nombre: "Enfoque cercano-lejano",
    emoji: "🔭",
    objetivo: "Relajar y ejercitar los músculos ciliares.",
    porQue:
      "Alternar distancias de enfoque entrena el cristalino y previene el espasmo acomodativo.",
    duracion: 200,
    duracionLabel: "3 min 20 s · 10 ciclos",
    pasos: [
      "Sostén tu dedo a 15 cm frente a tus ojos.",
      "Enfoca en tu dedo durante 10 segundos.",
      "Luego cambia el enfoque a un objeto lejano (mínimo 6 m).",
      "Repite el ciclo 10 veces.",
    ],
    guia: "No mires fijo la pantalla: el conteo grande y el punto marcan el ritmo de cada fase de 10 s.",
  },
  {
    id: "masaje-palpebral",
    nombre: "Masaje palpebral con calor",
    emoji: "🤲",
    objetivo: "Aliviar tensión muscular periocular.",
    porQue:
      "El calor suave mejora la secreción lipídica de la lágrima y estabiliza la película lagrimal.",
    duracion: 40,
    duracionLabel: "40 s · 10 s de preparación + 30 s",
    pasos: [
      "Frota tus manos hasta calentarlas.",
      "Colócalas suavemente sobre los párpados cerrados durante 30 segundos.",
      "Respira profundamente y relájate.",
    ],
    guia: "Primero la guía te muestra cómo frotar y colocar las palmas; luego marca la respiración.",
  },
  {
    id: "palming",
    nombre: "Palming (oscurecimiento visual)",
    emoji: "🌑",
    objetivo: "Relajar la vista con oscuridad.",
    porQue:
      "La oscuridad completa permite que la retina y la mente descansen del estímulo lumínico constante.",
    duracion: 60,
    duracionLabel: "1 min",
    pasos: [
      "Cubre los ojos con las palmas sin presionar los globos oculares.",
      "Asegúrate de bloquear toda la luz.",
      "Respira lento y profundo durante 1 minuto.",
    ],
    guia: "La pantalla se oscurece contigo y respira a tu ritmo; al final te avisa con una salida suave.",
  },
  {
    id: "push-up-pencil",
    nombre: "Push up pencil",
    emoji: "✏️",
    objetivo: "Mejorar control oculomotor.",
    porQue:
      "El seguimiento lento de un objetivo entrena la convergencia y mejora el control oculomotor.",
    duracion: 60,
    duracionLabel: "1 min",
    pasos: [
      "Sostén un lápiz frente a ti.",
      "Muévelo lentamente de izquierda a derecha y luego arriba-abajo.",
      "Sigue con la mirada sin mover la cabeza.",
      "Realiza por 1 minuto.",
    ],
    guia: "Si no tienes un lápiz a mano, el punto naranja hace de lápiz: síguelo sin mover la cabeza.",
  },
];

export function getEjercicio(id: string) {
  return EJERCICIOS.find((e) => e.id === id);
}

export function randomEjercicio() {
  return EJERCICIOS[Math.floor(Math.random() * EJERCICIOS.length)];
}
