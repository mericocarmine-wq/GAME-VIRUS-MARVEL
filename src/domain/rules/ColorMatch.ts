import { Color } from '../value-objects/Color';
import { CartaVillano } from '../entities/CartaVillano';
import { CartaAliado } from '../entities/CartaAliado';

/**
 * Funciones puras de coincidencia de color. Viven separadas de las
 * entidades para no repetir esta lógica en cada punto donde se
 * necesita comparar Villano/Poder/Aliado contra el color efectivo
 * de un Héroe (SRP: "cómo se compara color" es un concepto propio).
 */

export function villanoCoincideConColor(villano: CartaVillano, colorHeroe: Color): boolean {
  return villano.colorObjetivo === 'cualquiera' || villano.colorObjetivo === colorHeroe;
}

export function aliadoCoincideConColor(aliado: CartaAliado, colorHeroe: Color): boolean {
  return aliado.cubreColor(colorHeroe);
}