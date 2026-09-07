import { describe, expect, it } from 'vitest';
import { CartaPoder } from '../CartaPoder';
import { Jugador } from '../Jugador';

const carta = (id: string) => new CartaPoder({ id, nombre: id, color: 'rojo' });

describe('Jugador', () => {
  it('protege su mano y permite retirar por identificador', () => {
    const jugador = new Jugador({ id: 'j1', nombre: 'Ana' });
    jugador.recibir(carta('1'));
    const copia = jugador.mano as CartaPoder[];
    copia.pop();
    expect(jugador.mano).toHaveLength(1);
    expect(jugador.retirarCarta('1').id).toBe('1');
  });

  it('no permite más de tres cartas', () => {
    const jugador = new Jugador({ id: 'j1', nombre: 'Ana' });
    ['1', '2', '3'].forEach((id) => {
      jugador.recibir(carta(id));
    });
    expect(() => jugador.recibir(carta('4'))).toThrow('tres cartas');
  });
});
