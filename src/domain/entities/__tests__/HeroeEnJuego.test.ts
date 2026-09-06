import { describe, expect, it } from 'vitest';
import { CartaHeroe } from '../CartaHeroe';
import { CartaPoder } from '../CartaPoder';
import { CartaVillano } from '../CartaVillano';
import { HeroeEnJuego } from '../HeroeEnJuego';

const heroe = () => new HeroeEnJuego(new CartaHeroe({ id: 'h1', nombre: 'Iron Man', color: 'rojo' }));
const poder = (id: string) => new CartaPoder({ id, nombre: 'Poder rojo', color: 'rojo' });
const villano = () => new CartaVillano({ id: 'v1', nombre: 'Villano rojo', colorObjetivo: 'rojo' });

describe('HeroeEnJuego', () => {
  it('pasa de libre a protegido y blindado', () => {
    const actual = heroe();
    actual.protegerCon(poder('p1'));
    expect(actual.estado).toBe('protegido');
    actual.protegerCon(poder('p2'));
    expect(actual.estado).toBe('blindado');
  });

  it('un villano elimina la protección antes de poder bloquear', () => {
    const actual = heroe();
    actual.protegerCon(poder('p1'));
    expect(actual.bloquearCon(villano())).not.toBeNull();
    expect(actual.estado).toBe('libre');
  });

  it('bloquea a un héroe libre y un poder lo libera', () => {
    const actual = heroe();
    actual.bloquearCon(villano());
    expect(actual.estado).toBe('bloqueado');
    expect(actual.combatirCon(poder('p1')).nombre).toBe('Villano rojo');
    expect(actual.estado).toBe('libre');
  });

  it('un héroe blindado es inmune', () => {
    const actual = heroe();
    actual.protegerCon(poder('p1'));
    actual.protegerCon(poder('p2'));
    expect(() => actual.bloquearCon(villano())).toThrow('inmune');
  });
});
