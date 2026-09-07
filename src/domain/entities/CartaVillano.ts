import type { ColorObjetivo } from '../value-objects/Color';
import { Carta } from './Carta';

/**
 * Carta de Villano. A diferencia de Poder, SÍ existe la variante
 * multicolor (Thanos), que puede enfrentarse a un Héroe de cualquier
 * color base. Se modela con ColorObjetivo ('cualquiera' | Color)
 * en vez de un booleano + color anulable, para que el value object
 * sea autoexplicativo en el punto de uso.
 */
export class CartaVillano extends Carta {
  readonly colorObjetivo: ColorObjetivo;

  constructor(params: { id: string; nombre: string; colorObjetivo: ColorObjetivo }) {
    super(params.id, 'villano', params.nombre);
    this.colorObjetivo = params.colorObjetivo;
  }
}
