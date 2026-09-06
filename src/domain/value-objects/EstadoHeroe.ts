/**
 * Estado de un Héroe en la zona de juego.
 * IMPORTANTE (regla oficial): "preparado" no es un estado en sí mismo,
 * es una condición derivada. Un Héroe cuenta como preparado si su
 * estado es 'libre', 'protegido' o 'blindado'. 'bloqueado' NUNCA cuenta.
 */
export type EstadoHeroe = 'libre' | 'protegido' | 'blindado' | 'bloqueado';

export function esEstadoPreparado(estado: EstadoHeroe): boolean {
  return estado !== 'bloqueado';
}

/**
 * Un Héroe blindado es inmune: no puede volver a bloquearse ni ser
 * afectado por la mayoría de cartas de Acción (Chasquido es la
 * excepción explícita en el reglamento).
 */
export function esInmune(estado: EstadoHeroe): boolean {
  return estado === 'blindado';
}
