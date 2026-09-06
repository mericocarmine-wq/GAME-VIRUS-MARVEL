import { describe, it, expect } from 'vitest';
import { CartaHeroe } from '../CartaHeroe';

describe('CartaHeroe', () => {
  it('crea un héroe normal con color', () => {
    const h = new CartaHeroe({ id: 'h1', nombre: 'Iron Man', color: 'rojo' });
    expect(h.color).toBe('rojo');
    expect(h.esMulticolor).toBe(false);
    expect(h.esIntangible).toBe(false);
  });

  it('crea un héroe multicolor sin color fijo', () => {
    const h = new CartaHeroe({
      id: 'h5',
      nombre: 'Capitana Marvel',
      color: null,
      esMulticolor: true,
    });
    expect(h.color).toBeNull();
  });

  it('crea un héroe intangible con color', () => {
    const h = new CartaHeroe({
      id: 'h6',
      nombre: 'Visión',
      color: 'azul',
      esIntangible: true,
    });
    expect(h.esIntangible).toBe(true);
  });

  it('rechaza multicolor + intangible simultáneos', () => {
    expect(
      () =>
        new CartaHeroe({
          id: 'x',
          nombre: 'Imposible',
          color: null,
          esMulticolor: true,
          esIntangible: true,
        }),
    ).toThrow();
  });

  it('rechaza multicolor con color fijo asignado', () => {
    expect(
      () =>
        new CartaHeroe({
          id: 'x',
          nombre: 'Imposible',
          color: 'rojo',
          esMulticolor: true,
        }),
    ).toThrow();
  });

  it('rechaza héroe no multicolor sin color', () => {
    expect(
      () => new CartaHeroe({ id: 'x', nombre: 'Imposible', color: null }),
    ).toThrow();
  });
});
