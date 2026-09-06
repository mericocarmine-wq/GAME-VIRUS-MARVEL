import { CartaAliado } from '../entities/CartaAliado';
import { CartaHeroe } from '../entities/CartaHeroe';
import { CartaPoder } from '../entities/CartaPoder';
import { CartaVillano } from '../entities/CartaVillano';
import { Color } from '../value-objects/Color';

/** Un héroe multicolor admite cartas de cualquiera de los cuatro colores. */
export function heroeAdmiteColor(heroe: CartaHeroe, color: Color): boolean {
  return heroe.esMulticolor || heroe.color === color;
}

export function poderCompatibleConHeroe(
  poder: CartaPoder,
  heroe: CartaHeroe,
): boolean {
  return heroeAdmiteColor(heroe, poder.color);
}

export function aliadoCompatibleConHeroe(
  aliado: CartaAliado,
  heroe: CartaHeroe,
): boolean {
  return !heroe.esIntangible && (
    heroe.esMulticolor ||
    (heroe.color !== null && aliado.cubreColor(heroe.color))
  );
}

export function villanoCompatibleConHeroe(
  villano: CartaVillano,
  heroe: CartaHeroe,
): boolean {
  return villano.colorObjetivo === 'cualquiera' ||
    heroe.esMulticolor ||
    heroe.color === villano.colorObjetivo;
}
