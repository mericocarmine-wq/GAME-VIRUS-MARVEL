import { Carta } from './Carta';
import { Color } from '../value-objects/Color';

/**
 * Carta de Héroe. Es multicolor XOR intangible XOR "normal"
 * (no pueden coexistir ambas propiedades especiales en la misma carta
 * según el catálogo oficial: Capitana Marvel es multicolor,
 * Visión es intangible, son cartas distintas). Los dos héroes
 * especiales carecen de color base.
 *
 * NOTA: el estado en mesa (libre/protegido/blindado/bloqueado) NO vive
 * aquí. Esta clase es la carta como concepto de catálogo; su posición
 * y las cartas apiladas sobre ella son responsabilidad de la entidad
 * ZonaDeJuego (Fase 2), para no mezclar "qué es la carta" con
 * "qué le está pasando ahora en la partida".
 */
export class CartaHeroe extends Carta {
  readonly color: Color | null; // null para multicolor o intangible
  readonly esMulticolor: boolean;
  readonly esIntangible: boolean;

  constructor(params: {
    id: string;
    nombre: string;
    color: Color | null;
    esMulticolor?: boolean;
    esIntangible?: boolean;
  }) {
    super(params.id, 'heroe', params.nombre);

    const esMulticolor = params.esMulticolor ?? false;
    const esIntangible = params.esIntangible ?? false;

    if (esMulticolor && esIntangible) {
      throw new Error(
        `Héroe "${params.nombre}": no puede ser multicolor e intangible a la vez`,
      );
    }
    if ((esMulticolor || esIntangible) && params.color !== null) {
      throw new Error(
        `Héroe "${params.nombre}": un héroe especial no debe tener color fijo`,
      );
    }
    if (!esMulticolor && !esIntangible && params.color === null) {
      throw new Error(
        `Héroe "${params.nombre}": un héroe no multicolor requiere color`,
      );
    }

    this.color = params.color;
    this.esMulticolor = esMulticolor;
    this.esIntangible = esIntangible;
  }
}
