import { describe, expect, it } from 'vitest';
import { CartaAliado } from '../../entities/CartaAliado';
import { CartaHeroe } from '../../entities/CartaHeroe';
import { CartaPoder } from '../../entities/CartaPoder';
import { CartaVillano } from '../../entities/CartaVillano';
import { aliadoCompatibleConHeroe, poderCompatibleConHeroe, villanoCompatibleConHeroe } from '../ColorMatch';

describe('compatibilidad de color', () => {
  const rojo = new CartaHeroe({ id: 'h1', nombre: 'Iron Man', color: 'rojo' });
  const multi = new CartaHeroe({ id: 'h2', nombre: 'Capitana Marvel', color: null, esMulticolor: true });
  const intangible = new CartaHeroe({ id: 'h3', nombre: 'Visión', color: null, esIntangible: true });

  it('exige el mismo color salvo para héroes multicolor', () => {
    expect(poderCompatibleConHeroe(new CartaPoder({ id: 'p1', nombre: 'Poder', color: 'rojo' }), rojo)).toBe(true);
    expect(poderCompatibleConHeroe(new CartaPoder({ id: 'p2', nombre: 'Poder', color: 'verde' }), rojo)).toBe(false);
    expect(poderCompatibleConHeroe(new CartaPoder({ id: 'p3', nombre: 'Poder', color: 'verde' }), multi)).toBe(true);
  });

  it('impide aliados sobre héroes intangibles', () => {
    const aliado = new CartaAliado({ id: 'a1', nombre: 'Aliado', colores: ['azul', 'verde'] });
    expect(aliadoCompatibleConHeroe(aliado, intangible)).toBe(false);
    expect(aliadoCompatibleConHeroe(aliado, multi)).toBe(true);
  });

  it('permite que un villano multicolor ataque cualquier héroe', () => {
    const thanos = new CartaVillano({ id: 'v1', nombre: 'Thanos', colorObjetivo: 'cualquiera' });
    expect(villanoCompatibleConHeroe(thanos, rojo)).toBe(true);
  });
});
