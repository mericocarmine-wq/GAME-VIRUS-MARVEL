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
    this.validarNuevoHeroe(heroe);
    const enJuego = new HeroeEnJuego(heroe);
    this.heroesInternos.push(enJuego);
    return enJuego;
  }

  transferirHeroeDesde(origen: ZonaDeJuego, id: string): HeroeEnJuego {
    if (origen === this) throw new Error('El origen y destino deben ser distintos');
    const heroe = origen.buscarHeroe(id);
    if (!heroe) throw new Error(`No existe el héroe ${id}`);
    this.validarNuevoHeroe(heroe.heroe);
    origen.retirarHeroe(id);
    this.heroesInternos.push(heroe);
    return heroe;
  }

  intercambiarCon(otra: ZonaDeJuego): void {
    if (otra === this) throw new Error('Las zonas deben ser distintas');
    const propios = this.heroesInternos.splice(0);
    const ajenos = otra.heroesInternos.splice(0);
    this.heroesInternos.push(...ajenos);
    otra.heroesInternos.push(...propios);
  }

  private validarNuevoHeroe(heroe: CartaHeroe): void {
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
