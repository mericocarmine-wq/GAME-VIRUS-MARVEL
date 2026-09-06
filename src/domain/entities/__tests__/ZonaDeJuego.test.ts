import { describe, expect, it } from 'vitest';
import { CartaHeroe } from '../CartaHeroe';
import { CartaVillano } from '../CartaVillano';
import { ZonaDeJuego } from '../ZonaDeJuego';

describe('ZonaDeJuego', () => {
  it('no permite colores fijos repetidos', () => {
    const zona = new ZonaDeJuego();
    zona.agregarHeroe(new CartaHeroe({ id: 'h1', nombre: 'Rojo', color: 'rojo' }));
    expect(() => zona.agregarHeroe(new CartaHeroe({ id: 'h2', nombre: 'Otro rojo', color: 'rojo' }))).toThrow();
  });

  it('permite hasta seis héroes distintos con multicolor e intangible', () => {
    const zona = new ZonaDeJuego();
    (['rojo', 'amarillo', 'verde', 'azul'] as const).forEach((color, i) => {
      zona.agregarHeroe(new CartaHeroe({ id: `h${i}`, nombre: color, color }));
    });
    zona.agregarHeroe(new CartaHeroe({ id: 'multi', nombre: 'Capitana Marvel', color: null, esMulticolor: true }));
    zona.agregarHeroe(new CartaHeroe({ id: 'intangible', nombre: 'Visión', color: null, esIntangible: true }));
    expect(zona.heroes).toHaveLength(6);
    expect(zona.haGanado()).toBe(true);
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

  it('un segundo villano captura y retira al héroe bloqueado', () => {
    const zona = new ZonaDeJuego();
    const actual = zona.agregarHeroe(new CartaHeroe({ id: 'h1', nombre: 'Rojo', color: 'rojo' }));
    actual.bloquearCon(new CartaVillano({ id: 'v1', nombre: 'Uno', colorObjetivo: 'rojo' }));
    const captura = zona.capturarHeroe('h1', new CartaVillano({ id: 'v2', nombre: 'Dos', colorObjetivo: 'rojo' }));
    expect(captura.villanos).toHaveLength(2);
    expect(zona.heroes).toHaveLength(0);
  });
});
