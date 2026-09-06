import { describe, expect, it } from 'vitest';
import { CartaHeroe } from '../CartaHeroe';
import { CartaVillano } from '../CartaVillano';
import { ZonaDeJuego } from '../ZonaDeJuego';

describe('ZonaDeJuego', () => {
  it('no permite colores fijos repetidos ni más de cuatro héroes', () => {
    const zona = new ZonaDeJuego();
    zona.agregarHeroe(new CartaHeroe({ id: 'h1', nombre: 'Rojo', color: 'rojo' }));
    expect(() => zona.agregarHeroe(new CartaHeroe({ id: 'h2', nombre: 'Otro rojo', color: 'rojo' }))).toThrow();
  });

  it('gana con cuatro colores distintos y preparados', () => {
    const zona = new ZonaDeJuego();
    (['rojo', 'amarillo', 'verde', 'azul'] as const).forEach((color, i) => {
      zona.agregarHeroe(new CartaHeroe({ id: `h${i}`, nombre: color, color }));
    });
    expect(zona.haGanado()).toBe(true);
  });

  it('no gana si uno de los héroes está bloqueado', () => {
    const zona = new ZonaDeJuego();
    const rojo = zona.agregarHeroe(new CartaHeroe({ id: 'h1', nombre: 'Rojo', color: 'rojo' }));
    (['amarillo', 'verde', 'azul'] as const).forEach((color, i) => {
      zona.agregarHeroe(new CartaHeroe({ id: `h${i + 2}`, nombre: color, color }));
    });
    rojo.bloquearCon(new CartaVillano({ id: 'v1', nombre: 'Villano', colorObjetivo: 'rojo' }));
    expect(zona.haGanado()).toBe(false);
  });
});
