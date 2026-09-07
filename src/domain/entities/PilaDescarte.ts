import type { Carta } from './Carta';

export class PilaDescarte {
  private cartasInternas: Carta[] = [];

  get cartas(): readonly Carta[] {
    return [...this.cartasInternas];
  }

  get cantidad(): number {
    return this.cartasInternas.length;
  }

  agregar(...cartas: readonly Carta[]): void {
    this.cartasInternas.push(...cartas);
  }

  vaciar(): Carta[] {
    const cartas = this.cartasInternas;
    this.cartasInternas = [];
    return cartas;
  }
}
