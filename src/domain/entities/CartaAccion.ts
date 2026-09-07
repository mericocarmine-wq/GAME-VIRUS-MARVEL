import type { IdAccion } from '../value-objects/TipoCarta';
import { Carta } from './Carta';

/**
 * Carta de Acción. Deliberadamente NO contiene el efecto aquí
 * (nada de "if idAccion === 'chasquido' ..."). Eso violaría OCP:
 * añadir una Acción nueva obligaría a tocar esta clase.
 *
 * En su lugar, idAccion es solo una clave que la capa de aplicación
 * (Fase 4, application/use-cases/acciones/*) usará para resolver
 * qué implementación de IEfectoAccion ejecutar. Esta entidad solo
 * sabe "qué carta es", no "qué hace".
 */
export class CartaAccion extends Carta {
  readonly idAccion: IdAccion;

  constructor(params: { id: string; nombre: string; idAccion: IdAccion }) {
    super(params.id, 'accion', params.nombre);
    this.idAccion = params.idAccion;
  }
}
