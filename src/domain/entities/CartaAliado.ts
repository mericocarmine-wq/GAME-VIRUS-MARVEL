import { Carta } from './Carta';
import { Color } from '../value-objects/Color';

/**
 * Carta de Aliado. Equivale a 2 cartas de Poder y cubre exactamente
 * 2 colores base (ej. Avispa+Hormiga = amarillo+verde). No puede
 * jugarse sobre Héroe intangible (regla explícita del reglamento);
 * esa validación es responsabilidad de las reglas (Fase 2), aquí
 * solo garantizamos el invariante de los 2 colores distintos.
 */
export class CartaAliado extends Carta {
  readonly colores: readonly [Color, Color];

  constructor(params: { id: string; nombre: string; colores: [Color, Color] }) {
    super(params.id, 'aliado', params.nombre);
    if (params.colores[0] === params.colores[1]) {
      throw new Error(`Aliado "${params.nombre}": los dos colores deben ser distintos`);
    }
    this.colores = params.colores;
  }

  cubreColor(color: Color): boolean {
    return this.colores.includes(color);
  }
}
