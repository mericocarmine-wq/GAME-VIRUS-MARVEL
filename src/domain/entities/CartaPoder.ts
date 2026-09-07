import type { Color } from '../value-objects/Color';
import { Carta } from './Carta';

/**
 * Carta de Poder. Siempre tiene un color fijo (no existe Poder
 * multicolor en el catálogo oficial: 4 colores x 5 = 20 Poderes).
 * Sus dos usos (Proteger / Combatir) son comportamiento de caso de
 * uso, no de la entidad — aquí solo vive el dato inmutable "color".
 */
export class CartaPoder extends Carta {
  readonly color: Color;

  constructor(params: { id: string; nombre: string; color: Color }) {
    super(params.id, 'poder', params.nombre);
    this.color = params.color;
  }
}
