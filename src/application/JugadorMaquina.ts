import { Partida } from './Partida';

/** Estrategia mínima y determinista para desarrollo local. */
export function ejecutarTurnoMaquina(partida: Partida, jugadorId: string): void {
  if (partida.jugadorActual.id !== jugadorId) throw new Error('No es el turno de la máquina');
  const carta = partida.jugadorActual.mano[0];
  if (!carta) throw new Error('La máquina no tiene cartas para jugar');
  partida.descartar(jugadorId, [carta.id]);
}
