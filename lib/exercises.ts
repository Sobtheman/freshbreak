export type Ejercicio = {
  id: string;
  nombre: string;
  emoji: string;
  objetivo: string;
  porQue: string;
  duracion: number; // segundos
  duracionLabel: string;
  pasos: string[];
};

export const EJERCICIOS: Ejercicio[] = [
  {
    id: "parpadeo-consciente",
    nombre: "Parpadeo consciente",
    emoji: "👁️",
    objetivo: "Restablecer la película lagrimal y aliviar la sequedad ocular.",
    porQue:
      "Frente a pantallas parpadeamos hasta un 60 % menos, lo que reseca la superficie del ojo.",
    duracion: 120,
    duracionLabel: "2 min · rondas de 10 parpadeos",
    pasos: [
      "Siéntate recto, relaja los hombros.",
      "Cierra los ojos suavemente por 2 segundos y ábrelos, siguiendo el ojo animado.",
      "Completa 10 parpadeos lentos por ronda.",
      "Descansa 10 segundos entre rondas y continúa durante 2 minutos.",
    ],
  },
  {
    id: "regla-20-20-20",
    nombre: "Regla 20-20-20",
    emoji: "⏱️",
    objetivo: "Relajar el músculo ciliar tras el enfoque sostenido de cerca.",
    porQue:
      "Cada 20 minutos de pantalla, mirar 20 segundos a 20 pies (6 m) reduce la fatiga acomodativa.",
    duracion: 60,
    duracionLabel: "1 min · 3 rondas de 20 s",
    pasos: [
      "Aparta la mirada de la pantalla: se atenuará para recordártelo.",
      "Busca un objeto bien iluminado a unos 6 metros (20 pies); una ventana ayuda.",
      "Manténlo enfocado mientras el anillo completa los 20 segundos.",
      "Repite 3 rondas.",
    ],
  },
  {
    id: "ocho-horizontal",
    nombre: "Ocho horizontal",
    emoji: "♾️",
    objetivo: "Ejercitar los músculos extraoculares con movimientos suaves y amplios.",
    porQue:
      "Los movimientos oculares amplios y controlados mejoran la coordinación y reducen la rigidez ocular.",
    duracion: 70,
    duracionLabel: "70 s · 30 s por sentido + pausa",
    pasos: [
      "Mantén la cabeza completamente quieta.",
      "Sigue el punto naranja con la mirada mientras traza un ocho acostado (∞).",
      "A los 30 segundos, descansa 10 segundos.",
      "El punto invierte el sentido: síguelo 30 segundos más.",
    ],
  },
  {
    id: "enfoque-cercano-lejano",
    nombre: "Enfoque cercano-lejano",
    emoji: "🔭",
    objetivo: "Flexibilizar la acomodación alternando entre foco cercano y lejano.",
    porQue:
      "Alternar distancias de enfoque entrena el cristalino y previene el espasmo acomodativo.",
    duracion: 200,
    duracionLabel: "3 min 20 s · 10 ciclos",
    pasos: [
      "Sostén tu dedo índice a 15 cm frente a tus ojos.",
      "Cuando el punto crezca: enfoca tu dedo (visión cercana) por 10 segundos.",
      "Cuando el punto se encoja: mira un objeto lejano (mínimo 6 m).",
      "Alterna cada 10 segundos hasta completar 10 ciclos.",
    ],
  },
  {
    id: "masaje-palpebral",
    nombre: "Masaje palpebral con calor",
    emoji: "🤲",
    objetivo: "Estimular las glándulas de Meibomio y relajar la musculatura palpebral.",
    porQue:
      "El calor suave mejora la secreción lipídica de la lágrima y estabiliza la película lagrimal.",
    duracion: 30,
    duracionLabel: "30 s",
    pasos: [
      "Frota tus palmas entre sí hasta sentir calor.",
      "Cierra los ojos y coloca las palmas ahuecadas sobre los párpados.",
      "Realiza pequeños círculos, sin presionar el globo ocular.",
      "Acompaña el masaje con la respiración guiada.",
    ],
  },
  {
    id: "palming",
    nombre: "Palming",
    emoji: "🌑",
    objetivo: "Descansar la retina en oscuridad total y bajar la activación visual.",
    porQue:
      "La oscuridad completa permite que la retina y la mente descansen del estímulo lumínico constante.",
    duracion: 60,
    duracionLabel: "1 min",
    pasos: [
      "Apoya los codos sobre la mesa.",
      "Cubre los ojos con las palmas sin tocar los párpados: oscuridad total.",
      "Sigue el círculo de respiración: inhala cuando crece, exhala cuando se contrae.",
      "Permanece así 1 minuto y retira las manos lentamente.",
    ],
  },
  {
    id: "push-up-pencil",
    nombre: "Push up pencil",
    emoji: "✏️",
    objetivo: "Fortalecer la convergencia y el seguimiento ocular suave.",
    porQue:
      "El seguimiento lento de un objetivo entrena la convergencia y mejora el control oculomotor.",
    duracion: 60,
    duracionLabel: "1 min",
    pasos: [
      "Mantén la cabeza quieta; solo se mueven los ojos.",
      "Sigue el punto naranja mientras cruza lentamente de izquierda a derecha.",
      "A los 30 segundos el movimiento pasa a ser vertical: síguelo igual.",
      "Si sientes tensión, parpadea y continúa.",
    ],
  },
];

export function getEjercicio(id: string) {
  return EJERCICIOS.find((e) => e.id === id);
}

export function randomEjercicio() {
  return EJERCICIOS[Math.floor(Math.random() * EJERCICIOS.length)];
}
