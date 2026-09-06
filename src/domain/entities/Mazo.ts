import { Carta } from './Carta';
import { BarajadorAleatorio, IBarajador } from '../services/IBarajador';

export class Mazo {
  private cartasInternas: Carta[];
  private readonly barajador: IBarajador;

  constructor(
    cartas: readonly Carta[],
    barajador: IBarajador = new BarajadorAleatorio(),
  ) {
    this.validarIdsUnicos(cartas);
    this.barajador = barajador;
    this.cartasInternas = this.barajador.barajar(cartas);
  }

  get cantidad(): number {
    return this.cartasInternas.length;
  }

  robar(): Carta | undefined {
    return this.cartasInternas.pop();
  }

  reponer(cartas: readonly Carta[]): void {
    if (this.cartasInternas.length > 0) {
      throw new Error('Solo se puede reponer un mazo agotado');
    }
    this.validarIdsUnicos(cartas);
    this.cartasInternas = this.barajador.barajar(cartas);
  }

  private validarIdsUnicos(cartas: readonly Carta[]): void {
    const ids = cartas.map(({ id }) => id);
    if (new Set(ids).size !== ids.length) {
      throw new Error('El mazo no puede contener identificadores repetidos');
    }
  }
}
