import type { Carta } from '../domain/entities/Carta';
import { CartaAccion } from '../domain/entities/CartaAccion';
import { CartaAliado } from '../domain/entities/CartaAliado';
import { CartaHeroe } from '../domain/entities/CartaHeroe';
import { CartaPoder } from '../domain/entities/CartaPoder';
import { CartaVillano } from '../domain/entities/CartaVillano';
import { Mazo } from '../domain/entities/Mazo';
import { COLORES_BASE, type Color } from '../domain/value-objects/Color';

export function crearMazoInicial(): Mazo {
  const cartas: Carta[] = [];
  COLORES_BASE.forEach((color) => {
    for (let i = 1; i <= 5; i += 1) {
      cartas.push(
        new CartaHeroe({ id: `heroe-${color}-${i}`, nombre: `Héroe ${color} ${i}`, color }),
      );
      cartas.push(
        new CartaPoder({ id: `poder-${color}-${i}`, nombre: `Poder ${color} ${i}`, color }),
      );
    }
    for (let i = 1; i <= 4; i += 1) {
      cartas.push(
        new CartaVillano({
          id: `villano-${color}-${i}`,
          nombre: `Villano ${color} ${i}`,
          colorObjetivo: color,
        }),
      );
    }
  });
  cartas.push(
    new CartaHeroe({
      id: 'heroe-multicolor',
      nombre: 'Capitana Marvel',
      color: null,
      esMulticolor: true,
    }),
    new CartaHeroe({ id: 'heroe-intangible', nombre: 'Visión', color: null, esIntangible: true }),
    new CartaVillano({ id: 'villano-multicolor', nombre: 'Thanos', colorObjetivo: 'cualquiera' }),
  );
  cartas.push(...crearAliados(), ...crearAcciones());
  return new Mazo(cartas);
}

function crearAliados(): CartaAliado[] {
  const pares: readonly [Color, Color][] = [
    ['rojo', 'amarillo'],
    ['verde', 'azul'],
    ['rojo', 'verde'],
    ['amarillo', 'azul'],
    ['rojo', 'azul'],
    ['amarillo', 'verde'],
  ];
  return pares.map(
    (colores, i) =>
      new CartaAliado({
        id: `aliado-${i + 1}`,
        nombre: `Aliado ${i + 1}`,
        colores: [...colores] as [Color, Color],
      }),
  );
}

function crearAcciones(): CartaAccion[] {
  return [
    new CartaAccion({ id: 'accion-reclutar-1', nombre: 'Reclutar', idAccion: 'reclutar' }),
    new CartaAccion({
      id: 'accion-alterar-1',
      nombre: 'Alterar la realidad',
      idAccion: 'alterar-realidad',
    }),
    new CartaAccion({ id: 'accion-chasquido-1', nombre: 'Chasquido', idAccion: 'chasquido' }),
  ];
}
