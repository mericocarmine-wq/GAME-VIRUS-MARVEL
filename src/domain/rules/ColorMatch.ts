import type { CartaAliado } from '../entities/CartaAliado';
import type { CartaHeroe } from '../entities/CartaHeroe';
import type { CartaPoder } from '../entities/CartaPoder';
import type { CartaVillano } from '../entities/CartaVillano';
import type { Color } from '../value-objects/Color';

/** Un héroe multicolor admite cartas de cualquiera de los cuatro colores. */
export function heroeAdmiteColor(heroe: CartaHeroe, color: Color): boolean {
  return !heroe.esIntangible && (heroe.esMulticolor || heroe.color === color);
}

export function poderCompatibleConHeroe(poder: CartaPoder, heroe: CartaHeroe): boolean {
  return heroeAdmiteColor(heroe, poder.color);
}

export function aliadoCompatibleConHeroe(aliado: CartaAliado, heroe: CartaHeroe): boolean {
  return (
    !heroe.esIntangible &&
    (heroe.esMulticolor || (heroe.color !== null && aliado.cubreColor(heroe.color)))
  );
}

export function villanoCompatibleConHeroe(villano: CartaVillano, heroe: CartaHeroe): boolean {
  return (
    !heroe.esIntangible &&
    (villano.colorObjetivo === 'cualquiera' ||
      heroe.esMulticolor ||
      heroe.color === villano.colorObjetivo)
  );
}

export function poderCompatibleConVillano(poder: CartaPoder, villano: CartaVillano): boolean {
  return villano.colorObjetivo !== 'cualquiera' && poder.color === villano.colorObjetivo;
}

export function aliadoCompatibleConVillano(aliado: CartaAliado, villano: CartaVillano): boolean {
  return villano.colorObjetivo === 'cualquiera' || aliado.cubreColor(villano.colorObjetivo);
}
