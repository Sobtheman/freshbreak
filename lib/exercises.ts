export type Ejercicio = {
  id: string;
  nombre: string;
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
    guia: "El ojo en pantalla marca el ritmo y un sonido te avisa cuándo cerrar y cuándo abrir los ojos.",
  },
  {
    id: "regla-20-20-20",
    nombre: "Regla 20-20-20",
    objetivo: "Relajar la acomodación ocular.",
    porQue:
      "Alternar 20 segundos de visión lejana (6 metros) con 20 segundos de visión cercana (20 centímetros) relaja y ejercita la acomodación.",
    duracion: 45,
    duracionLabel: "45 s · 20 s lejos + 20 s cerca",
    pasos: [
      "Cada 60 minutos, mira un objeto a 20 pies (6 metros) durante 20 segundos.",
      "Enseguida, enfoca un objeto a 20 centímetros durante 20 segundos.",
      "Asegúrate de que ambos objetos estén bien iluminados.",
      "Puedes usar la ventana como punto lejano y tu dedo o un lápiz como punto cercano.",
    ],
    guia: "La pantalla se apaga y solo queda un conteo gigante: un aviso sonoro te indica cuándo pasar del punto lejano al cercano.",
  },
  {
    id: "ocho-horizontal",
    nombre: "Movimiento ocular en forma de ocho",
    objetivo: "Estimular movilidad ocular.",
    porQue:
      "Los movimientos oculares amplios y controlados mejoran la coordinación y reducen la rigidez ocular.",
    duracion: 70,
    duracionLabel: "70 s · 30 s por sentido + descanso",
    pasos: [
      "Mira el número ocho horizontal (∞) que aparece en la pantalla.",
      "Con tus ojos, sin mover la cabeza, síguelo durante 30 segundos en una dirección y 30 segundos en la otra.",
      "Descansa 10 segundos.",
    ],
    guia: "El punto naranja recorre el ocho a velocidad constante; síguelo solo con la mirada. Un sonido avisa cuándo cerrar los ojos en el descanso y cuándo abrirlos.",
  },
  {
    id: "enfoque-cercano-lejano",
    nombre: "Enfoque cercano-lejano",
    objetivo: "Relajar y ejercitar los músculos ciliares.",
    porQue:
      "Alternar distancias de enfoque entrena el músculo ciliar y previene el espasmo acomodativo.",
    duracion: 200,
    duracionLabel: "3 min 20 s · 10 ciclos",
    pasos: [
      "Sostén tu dedo a 15 centímetros frente a tus ojos.",
      "Enfoca en tu dedo durante 10 segundos.",
      "Luego cambia el enfoque a un objeto lejano (mínimo 6 metros).",
      "Repite el ciclo 10 veces.",
    ],
    guia: "No mires fijo la pantalla: un tono grave avisa que enfoques cerca y uno agudo que enfoques lejos, cada 10 segundos.",
  },
  {
    id: "masaje-palpebral",
    nombre: "Masaje palpebral con calor",
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
    guia: "La guía te muestra cómo frotar y colocar las palmas; con los ojos tapados, el sonido marca la respiración y avisa cuándo abrirlos.",
  },
  {
    id: "palming",
    nombre: "Palming (oscurecimiento visual)",
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
    guia: "Con los ojos cubiertos te guía el sonido: marca la respiración y avisa cuándo abrir los ojos al terminar.",
  },
  {
    id: "push-up-pencil",
    nombre: "Push up pencil",
    objetivo: "Entrenar la convergencia y el control oculomotor.",
    porQue:
      "Acercar un objetivo hasta el punto en que se ve doble entrena la convergencia, que es la capacidad de los dos ojos de apuntar juntos a lo cercano.",
    duracion: 60,
    duracionLabel: "1 min",
    pasos: [
      "Sostén un lápiz frente a ti, a la altura de los ojos y con el brazo extendido.",
      "Acércalo lentamente hacia el centro de tus ojos, mirándolo fijamente.",
      "Detente cuando empieces a verlo doble.",
      "Aléjalo despacio hasta volver a ver un solo lápiz y repite durante 1 minuto.",
    ],
    guia: "El lápiz de la pantalla imita lo que debes ver: crece al acercarse y se desdobla en la zona de visión doble.",
  },
];

export function getEjercicio(id: string) {
  return EJERCICIOS.find((e) => e.id === id);
}

export function randomEjercicio() {
  return EJERCICIOS[Math.floor(Math.random() * EJERCICIOS.length)];
}
