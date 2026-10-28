// System Usability Scale (SUS), versión en español validada:
// Sevilla-Gonzalez MDR, Moreno Loaeza L, Lazaro-Carrera LS, Bourguet Ramirez B,
// Vázquez Rodríguez A, Peralta-Pedrero ML, Almeda-Valdes P. Spanish Version of
// the System Usability Scale for the Assessment of Electronic Tools:
// Development and Validation. JMIR Hum Factors. 2020;7(4):e21161.
// doi:10.2196/21161
//
// Los diez enunciados se transcriben tal cual del Anexo 2 del artículo; no
// se reescriben, porque cambiar la redacción invalida la escala.

export const SUS_ITEMS: string[] = [
  "Me gustaría usar esta herramienta frecuentemente.",
  "Considero que esta herramienta es innecesariamente compleja",
  "Considero que la herramienta es fácil de usar.",
  "Considero necesario el apoyo de personal experto para poder utilizar esta herramienta",
  "Considero que las funciones de la herramienta están bien integradas",
  "Considero que la herramienta presenta muchas contradicciones",
  "Imagino que la mayoría de las personas aprenderían a usar esta herramienta rápidamente",
  "Considero que el uso de esta herramienta es tedioso",
  "Me sentí muy confiado al usar la herramienta",
  "Necesité saber bastantes cosas antes de poder empezar a usar esta herramienta",
];

export const SUS_INSTRUCCION =
  "Por favor seleccione de cada uno de los enunciados la opción que mejor describa su experiencia con la herramienta electrónica. Un puntaje de 1 significa que usted se encuentra totalmente en desacuerdo con el enunciado, mientras que un puntaje en 5 significa que está totalmente de acuerdo, un puntaje de 3 significaría que usted se encuentra neutral con el enunciado.";

export const SUS_EXTREMOS = ["Totalmente en desacuerdo", "Totalmente de acuerdo"] as const;

export type RespuestaSUS = 1 | 2 | 3 | 4 | 5;

export function susValidas(r: unknown): r is RespuestaSUS[] {
  return (
    Array.isArray(r) &&
    r.length === SUS_ITEMS.length &&
    r.every((v) => Number.isInteger(v) && v >= 1 && v <= 5)
  );
}

// Puntuación estándar de Brooke: ítems impares (redacción positiva) aportan
// respuesta − 1; pares (negativa) aportan 5 − respuesta; la suma × 2,5 da
// un valor de 0 a 100.
export function puntajeSUS(r: RespuestaSUS[]): number {
  const suma = r.reduce((s, v, i) => s + (i % 2 === 0 ? v - 1 : 5 - v), 0);
  return suma * 2.5;
}

// Rangos de interpretación que usa la metodología del trabajo de grado.
export function interpretarSUS(p: number): string {
  if (p < 50) return "baja usabilidad";
  if (p < 68) return "usabilidad aceptable";
  if (p < 80) return "buena usabilidad";
  return "excelente usabilidad";
}
