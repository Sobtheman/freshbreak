// Parámetros del estudio: la intervención dura seis semanas y al final se
// repite el CVS-Q y se aplica la escala SUS (objetivos específicos 3 y 4).

export const DIAS_INTERVENCION = 42;
// Si la invitación de cierre no se responde, un único recordatorio después de:
export const DIAS_RECORDATORIO_CIERRE = 3;
// Franja (hora de Bogotá) en la que el cron envía los correos de cierre.
export const CIERRE_DESDE_MIN = 9 * 60;
export const CIERRE_HASTA_MIN = 19 * 60;

export type EstadoCierre = {
  dias: number; // días transcurridos desde el registro
  disponible: boolean; // ya puede responder la evaluación final
  completado: boolean;
  diasRestantes: number;
};

export function estadoCierre(
  creado: string | Date,
  cierreEnviado: string | Date | null,
  completado: boolean
): EstadoCierre {
  const dias = Math.floor((Date.now() - new Date(creado).getTime()) / 86400000);
  // El equipo puede abrir el cierre antes (invitación manual): en ese caso
  // la evaluación queda disponible aunque no hayan pasado los 42 días.
  const disponible = dias >= DIAS_INTERVENCION || cierreEnviado !== null;
  return {
    dias,
    disponible,
    completado,
    diasRestantes: Math.max(0, DIAS_INTERVENCION - dias),
  };
}
