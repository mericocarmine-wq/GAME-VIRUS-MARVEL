import { describe, expect, it } from 'vitest';
import { CartaPoder } from '../../domain/entities/CartaPoder';
import { Jugador } from '../../domain/entities/Jugador';
import { Mazo } from '../../domain/entities/Mazo';
import type { IBarajador } from '../../domain/services/IBarajador';
import { ejecutarTurnoMaquina } from '../JugadorMaquina';
import { Partida } from '../Partida';

class SinBarajar implements IBarajador {
  barajar<T>(cartas: readonly T[]): T[] {
    return [...cartas];
  }
}

describe('JugadorMaquina', () => {
  it('descarta una carta válida y cede el turno', () => {
    const humana = new Jugador({ id: 'humana', nombre: 'Humana' });
    const maquina = new Jugador({ id: 'maquina', nombre: 'Máquina' });
    const cartas = Array.from(
      { length: 7 },
      (_, i) => new CartaPoder({ id: `p${i}`, nombre: `P${i}`, color: 'rojo' }),
    );
    const partida = Partida.iniciar({
      jugadores: [maquina, humana],
      mazo: new Mazo(cartas, new SinBarajar()),
    });
    ejecutarTurnoMaquina(partida, maquina.id);
    expect(partida.descarte.cantidad).toBe(1);
    expect(partida.jugadorActual).toBe(humana);
  });
});
