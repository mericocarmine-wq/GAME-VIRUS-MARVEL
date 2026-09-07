import { describe, expect, it } from 'vitest';
import { CartaAliado } from '../CartaAliado';

describe('CartaAliado', () => {
  it('crea un aliado con dos colores distintos', () => {
    const a = new CartaAliado({
      id: 'a1',
      nombre: 'Avispa/Hormiga',
      colores: ['amarillo', 'verde'],
    });
    expect(a.cubreColor('amarillo')).toBe(true);
    expect(a.cubreColor('rojo')).toBe(false);
  });

  it('rechaza dos colores iguales', () => {
    expect(
      () => new CartaAliado({ id: 'x', nombre: 'Imposible', colores: ['rojo', 'rojo'] }),
    ).toThrow();
  });
});
