import { HeroeEnJuego } from './HeroeEnJuego';
import { CartaHeroe } from './CartaHeroe';
import { esEstadoPreparado } from '../value-objects/EstadoHeroe';

/**
 * Zona de juego de UN jugador: su equipo de Héroes en mesa.
 * Responsable únicamente de: añadir héroes, listar el equipo,
 * y determinar la condición de victoria. NO conoce el mazo, la mano
 * ni el turno — eso pertenece a la capa de aplicación (Fase 3).
 */
export class ZonaDeJuego {
  private heroes: HeroeEnJuego[] = [];

  /** Máximo del reglamento: 6 si hay multicolor + intangible en equipo. */
  private static readonly MAX_HEROES = 6;

  agregarHeroe(heroe: HeroeEnJuego): void {
    if (this.heroes.length >= ZonaDeJuego.MAX_HEROES) {
      throw new Error(`No se pueden tener más de ${ZonaDeJuego.MAX_HEROES} Héroes en equipo`);
    }
    if (!heroe.carta.esMulticolor) {
      const colorYaEnEquipo = this.heroes.some(
        (h) => !h.carta.esMulticolor && h.colorEfectivo() === heroe.colorEfectivo(),
      );
      if (colorYaEnEquipo) {
        throw new Error('No puedes tener dos Héroes del mismo color en tu equipo');
      }
    }
    this.heroes.push(heroe);
  }

  eliminarHeroe(carta: CartaHeroe): void {
    this.heroes = this.heroes.filter((h) => h.carta.id !== carta.id);
  }

  listarHeroes(): readonly HeroeEnJuego[] {
    return this.heroes;
  }

  /**
   * Condición de victoria: 4 Héroes preparados de colores efectivos
   * distintos. Un multicolor cuenta por el color que eligió al jugarse
   * (regla confirmada: se fija una vez y no cambia).
   */
  haGanado(): boolean {
    const coloresPreparados = new Set(
      this.heroes.filter((h) => esEstadoPreparado(h.estado())).map((h) => h.colorEfectivo()),
    );
    return coloresPreparados.size >= 4;
  }

  contarPreparados(): number {
    return this.heroes.filter((h) => esEstadoPreparado(h.estado())).length;
  }
}