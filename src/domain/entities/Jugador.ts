import { Carta } from './Carta';
import { ZonaDeJuego } from './ZonaDeJuego';

export class Jugador {
  static readonly TAMANO_MANO = 3;
  readonly id: string;
  readonly nombre: string;
  readonly zona: ZonaDeJuego;
  private cartasEnMano: Carta[] = [];

  constructor(params: { id: string; nombre: string; zona?: ZonaDeJuego }) {
    if (!params.id.trim()) throw new Error('Un jugador debe tener id');
    if (!params.nombre.trim()) throw new Error('Un jugador debe tener nombre');
    this.id = params.id;
    this.nombre = params.nombre;
    this.zona = params.zona ?? new ZonaDeJuego();
  }

  get mano(): readonly Carta[] {
    return [...this.cartasEnMano];
  }

  recibir(carta: Carta): void {
    if (this.cartasEnMano.length >= Jugador.TAMANO_MANO) {
      throw new Error('La mano ya tiene tres cartas');
    }
    if (this.cartasEnMano.some(({ id }) => id === carta.id)) {
      throw new Error(`La carta ${carta.id} ya está en la mano`);
    }
    this.cartasEnMano.push(carta);
  }

  tieneCarta(id: string): boolean {
    return this.cartasEnMano.some((carta) => carta.id === id);
  }

  obtenerCarta(id: string): Carta {
    const carta = this.cartasEnMano.find((actual) => actual.id === id);
    if (!carta) throw new Error(`La carta ${id} no está en la mano`);
    return carta;
  }

  retirarCarta(id: string): Carta {
    const indice = this.cartasEnMano.findIndex((carta) => carta.id === id);
    if (indice < 0) throw new Error(`La carta ${id} no está en la mano`);
    return this.cartasEnMano.splice(indice, 1)[0];
  }
}
