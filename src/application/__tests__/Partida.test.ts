import { describe, expect, it } from 'vitest';
import { Partida } from '../Partida';
import { Carta } from '../../domain/entities/Carta';
import { CartaHeroe } from '../../domain/entities/CartaHeroe';
import { CartaPoder } from '../../domain/entities/CartaPoder';
import { CartaVillano } from '../../domain/entities/CartaVillano';
import { Jugador } from '../../domain/entities/Jugador';
import { Mazo } from '../../domain/entities/Mazo';
import { IBarajador } from '../../domain/services/IBarajador';

class SinBarajar implements IBarajador {
  barajar<T>(elementos: readonly T[]): T[] {
    return [...elementos];
  }
}

const poder = (id: string, color: 'rojo' | 'amarillo' | 'verde' | 'azul' = 'rojo') =>
  new CartaPoder({ id, nombre: id, color });

function crearPartida(
  cartas: readonly Carta[] = Array.from({ length: 10 }, (_, i) => poder(`p${i}`)),
) {
  const ana = new Jugador({ id: 'ana', nombre: 'Ana' });
  const bob = new Jugador({ id: 'bob', nombre: 'Bob' });
  const partida = Partida.iniciar({
    jugadores: [ana, bob],
    mazo: new Mazo(cartas, new SinBarajar()),
  });
  return { partida, ana, bob };
}

describe('Partida', () => {
  it('reparte tres cartas y asigna el primer turno', () => {
    const { partida, ana, bob } = crearPartida();
    expect(ana.mano).toHaveLength(3);
    expect(bob.mano).toHaveLength(3);
    expect(partida.jugadorActual).toBe(ana);
  });

  it('descarta varias cartas, repone la mano y pasa el turno', () => {
    const { partida, ana, bob } = crearPartida();
    const ids = ana.mano.slice(0, 2).map(({ id }) => id);
    partida.descartar(ana.id, ids);
    expect(ana.mano).toHaveLength(3);
    expect(partida.descarte.cantidad).toBe(2);
    expect(partida.jugadorActual).toBe(bob);
  });

  it('recicla el descarte cuando se agota el mazo', () => {
    const { partida, ana } = crearPartida(
      Array.from({ length: 6 }, (_, i) => poder(`p${i}`)),
    );
    partida.descartar(ana.id, ana.mano.slice(0, 2).map(({ id }) => id));
    expect(ana.mano).toHaveLength(3);
    expect(partida.descarte.cantidad).toBe(0);
  });

  it('juega un héroe, repone la mano y no permite actuar fuera de turno', () => {
    const cartas = [
      ...Array.from({ length: 7 }, (_, i) => poder(`p${i}`)),
      new CartaHeroe({ id: 'heroe', nombre: 'Iron Man', color: 'rojo' }),
    ];
    const { partida, ana, bob } = crearPartida(cartas);
    partida.jugarHeroe(ana.id, 'heroe');
    expect(ana.zona.buscarHeroe('heroe')).toBeDefined();
    expect(ana.mano).toHaveLength(3);
    expect(partida.jugadorActual).toBe(bob);
    expect(() => partida.descartar(ana.id, [ana.mano[0].id])).toThrow('turno');
  });

  it('integra bloqueo, combate y descarte de las cartas usadas', () => {
    const { partida, ana, bob } = crearPartida();
    const heroe = new CartaHeroe({ id: 'h1', nombre: 'Iron Man', color: 'rojo' });
    bob.zona.agregarHeroe(heroe);
    const villano = new CartaVillano({ id: 'v1', nombre: 'Villano', colorObjetivo: 'rojo' });
    // Sustituimos una carta de la mano conservando el invariante de tres.
    ana.retirarCarta(ana.mano[0].id);
    ana.recibir(villano);
    partida.jugarVillano(ana.id, villano.id, bob.id, heroe.id);
    expect(bob.zona.buscarHeroe(heroe.id)?.estado).toBe('bloqueado');

    partida.descartar(bob.id, [bob.mano[0].id]);
    const combate = poder('combate');
    ana.retirarCarta(ana.mano[0].id);
    ana.recibir(combate);
    // Combatir solo está permitido sobre los héroes propios.
    expect(() => partida.combatirVillano(ana.id, combate.id, heroe.id)).toThrow('No existe');
  });

  it('no permite jugar un villano contra el equipo propio', () => {
    const { partida, ana } = crearPartida();
    const heroe = new CartaHeroe({ id: 'h1', nombre: 'Iron Man', color: 'rojo' });
    ana.zona.agregarHeroe(heroe);
    const villano = new CartaVillano({ id: 'v1', nombre: 'Villano', colorObjetivo: 'rojo' });
    ana.retirarCarta(ana.mano[0].id);
    ana.recibir(villano);
    expect(() => partida.jugarVillano(ana.id, villano.id, ana.id, heroe.id)).toThrow('rival');
    expect(ana.tieneCarta(villano.id)).toBe(true);
  });

  it('declara ganador y detiene la partida al completar cuatro preparados', () => {
    const ana = new Jugador({ id: 'ana', nombre: 'Ana' });
    const bob = new Jugador({ id: 'bob', nombre: 'Bob' });
    (['rojo', 'amarillo', 'verde'] as const).forEach((color, i) => {
      ana.zona.agregarHeroe(new CartaHeroe({ id: `h${i}`, nombre: color, color }));
    });
    const azul = new CartaHeroe({ id: 'azul', nombre: 'Azul', color: 'azul' });
    const cartas = [...Array.from({ length: 5 }, (_, i) => poder(`p${i}`)), azul];
    const partida = Partida.iniciar({
      jugadores: [ana, bob],
      mazo: new Mazo(cartas, new SinBarajar()),
    });
    partida.jugarHeroe(ana.id, azul.id);
    expect(partida.ganador).toBe(ana);
    expect(() => partida.descartar(ana.id, [ana.mano[0].id])).toThrow('terminado');
  });
});
