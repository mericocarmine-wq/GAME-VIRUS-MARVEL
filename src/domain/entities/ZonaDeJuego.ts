import { CartaHeroe } from './CartaHeroe';
import { Captura, HeroeEnJuego } from './HeroeEnJuego';
import { CartaVillano } from './CartaVillano';
import { Color } from '../value-objects/Color';

export class ZonaDeJuego {
  static readonly MAX_HEROES = 6;
  private readonly heroesInternos: HeroeEnJuego[] = [];

  get heroes(): readonly HeroeEnJuego[] {
    return [...this.heroesInternos];
  }

  agregarHeroe(heroe: CartaHeroe): HeroeEnJuego {
    if (this.heroesInternos.length >= ZonaDeJuego.MAX_HEROES) {
      throw new Error('La zona de juego ya tiene seis héroes');
    }
    if (this.buscarHeroe(heroe.id)) throw new Error(`Ya existe la carta ${heroe.id}`);
    if (heroe.color !== null && this.coloresFijos().has(heroe.color)) {
      throw new Error(`Ya hay un héroe de color ${heroe.color}`);
    }
    if (heroe.esMulticolor && this.heroesInternos.some(({ heroe: actual }) => actual.esMulticolor)) {
      throw new Error('Ya hay un héroe multicolor');
    }
    if (heroe.esIntangible && this.heroesInternos.some(({ heroe: actual }) => actual.esIntangible)) {
      throw new Error('Ya hay un héroe intangible');
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

  capturarHeroe(id: string, villano: CartaVillano): Captura {
    const actual = this.buscarHeroe(id);
    if (!actual) throw new Error(`No existe el héroe ${id}`);
    const captura = actual.capturarCon(villano);
    this.retirarHeroe(id);
    return captura;
  }

  /** Gana quien reúne cuatro héroes preparados que pueden representar colores distintos. */
  haGanado(): boolean {
    return this.heroesInternos.filter((heroe) => heroe.estaPreparado).length >= 4;
  }

  private coloresFijos(): Set<Color> {
    return new Set(
      this.heroesInternos
        .map(({ heroe }) => heroe.color)
        .filter((color): color is Color => color !== null),
    );
  }
}
