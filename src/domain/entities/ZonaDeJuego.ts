import { CartaHeroe } from './CartaHeroe';
import { HeroeEnJuego } from './HeroeEnJuego';
import { COLORES_BASE, Color } from '../value-objects/Color';

export class ZonaDeJuego {
  static readonly MAX_HEROES = 4;
  private readonly heroesInternos: HeroeEnJuego[] = [];

  get heroes(): readonly HeroeEnJuego[] {
    return [...this.heroesInternos];
  }

  agregarHeroe(heroe: CartaHeroe): HeroeEnJuego {
    if (this.heroesInternos.length >= ZonaDeJuego.MAX_HEROES) {
      throw new Error('La zona de juego ya tiene cuatro héroes');
    }
    if (this.buscarHeroe(heroe.id)) throw new Error(`Ya existe la carta ${heroe.id}`);
    if (heroe.color !== null && this.coloresFijos().has(heroe.color)) {
      throw new Error(`Ya hay un héroe de color ${heroe.color}`);
    }
    const enJuego = new HeroeEnJuego(heroe);
    this.heroesInternos.push(enJuego);
    return enJuego;
  }

  buscarHeroe(id: string): HeroeEnJuego | undefined {
    return this.heroesInternos.find(({ heroe }) => heroe.id === id);
  }

  retirarHeroe(id: string): HeroeEnJuego {
    const indice = this.heroesInternos.findIndex(({ heroe }) => heroe.id === id);
    if (indice < 0) throw new Error(`No existe el héroe ${id}`);
    return this.heroesInternos.splice(indice, 1)[0];
  }

  /** Gana quien reúne cuatro héroes preparados que pueden representar colores distintos. */
  haGanado(): boolean {
    if (this.heroesInternos.length !== ZonaDeJuego.MAX_HEROES) return false;
    if (!this.heroesInternos.every((heroe) => heroe.estaPreparado)) return false;
    const fijos = this.coloresFijos();
    const comodines = this.heroesInternos.filter(({ heroe }) => heroe.esMulticolor).length;
    return fijos.size + comodines === COLORES_BASE.length;
  }

  private coloresFijos(): Set<Color> {
    return new Set(
      this.heroesInternos
        .map(({ heroe }) => heroe.color)
        .filter((color): color is Color => color !== null),
    );
  }
}
