import { describe, expect, it } from 'vitest';
import { crearRegistroAcciones } from '../acciones';
import { CartaHeroe } from '../../domain/entities/CartaHeroe';
import { CartaPoder } from '../../domain/entities/CartaPoder';
import { Jugador } from '../../domain/entities/Jugador';

const heroe = (id: string, color: 'rojo' | 'amarillo' | 'verde' | 'azul') =>
  new CartaHeroe({ id, nombre: id, color });
const poder = (id: string) => new CartaPoder({ id, nombre: id, color: 'rojo' });
const contexto = (actor: Jugador, rival: Jugador) => ({ actor, jugadores: [actor, rival] });

describe('acciones especiales', () => {
  it('Reclutar transfiere un héroe no blindado de un rival', () => {
    const ana = new Jugador({ id: 'ana', nombre: 'Ana' });
    const bob = new Jugador({ id: 'bob', nombre: 'Bob' });
    bob.zona.agregarHeroe(heroe('h1', 'rojo'));
    crearRegistroAcciones().obtener('reclutar').ejecutar(contexto(ana, bob), {
      jugadorOrigenId: 'bob', heroeId: 'h1',
    });
    expect(ana.zona.buscarHeroe('h1')).toBeDefined();
    expect(bob.zona.buscarHeroe('h1')).toBeUndefined();
  });

  it('Reclutar rechaza héroes blindados', () => {
    const ana = new Jugador({ id: 'ana', nombre: 'Ana' });
    const bob = new Jugador({ id: 'bob', nombre: 'Bob' });
    const objetivo = bob.zona.agregarHeroe(heroe('h1', 'rojo'));
    objetivo.protegerCon(poder('p1'));
    objetivo.protegerCon(poder('p2'));
    expect(() => crearRegistroAcciones().obtener('reclutar').ejecutar(contexto(ana, bob), {
      jugadorOrigenId: 'bob', heroeId: 'h1',
    })).toThrow('blindado');
  });

  it('Alterar la realidad intercambia equipos completos', () => {
    const ana = new Jugador({ id: 'ana', nombre: 'Ana' });
    const bob = new Jugador({ id: 'bob', nombre: 'Bob' });
    ana.zona.agregarHeroe(heroe('a', 'rojo'));
    bob.zona.agregarHeroe(heroe('b', 'azul'));
    crearRegistroAcciones().obtener('alterar-realidad').ejecutar(contexto(ana, bob), { jugadorObjetivoId: 'bob' });
    expect(ana.zona.buscarHeroe('b')).toBeDefined();
    expect(bob.zona.buscarHeroe('a')).toBeDefined();
  });

  it('Chasquido elimina el suelo de la mitad de cada equipo, incluso blindados', () => {
    const ana = new Jugador({ id: 'ana', nombre: 'Ana' });
    const bob = new Jugador({ id: 'bob', nombre: 'Bob' });
    const blindado = ana.zona.agregarHeroe(heroe('a1', 'rojo'));
    blindado.protegerCon(poder('p1'));
    blindado.protegerCon(poder('p2'));
    ana.zona.agregarHeroe(heroe('a2', 'azul'));
    ana.zona.agregarHeroe(heroe('a3', 'verde'));
    bob.zona.agregarHeroe(heroe('b1', 'amarillo'));
    bob.zona.agregarHeroe(heroe('b2', 'rojo'));
    const descartes = crearRegistroAcciones().obtener('chasquido').ejecutar(contexto(ana, bob), {
      heroesPorJugador: { ana: ['a1'], bob: ['b1'] },
    });
    expect(ana.zona.heroes).toHaveLength(2);
    expect(bob.zona.heroes).toHaveLength(1);
    expect(descartes.map(({ id }) => id)).toEqual(expect.arrayContaining(['a1', 'p1', 'p2', 'b1']));
  });
});
