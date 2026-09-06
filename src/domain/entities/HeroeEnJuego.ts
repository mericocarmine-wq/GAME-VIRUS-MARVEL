import { CartaAliado } from './CartaAliado';
import { CartaHeroe } from './CartaHeroe';
import { CartaPoder } from './CartaPoder';
import { CartaVillano } from './CartaVillano';
import {
  aliadoCompatibleConHeroe,
  poderCompatibleConHeroe,
  villanoCompatibleConHeroe,
} from '../rules/ColorMatch';
import { EstadoHeroe, esEstadoPreparado } from '../value-objects/EstadoHeroe';

export type Proteccion = CartaPoder | CartaAliado;

/** La carta de catálogo junto con su estado mutable durante la partida. */
export class HeroeEnJuego {
  readonly heroe: CartaHeroe;
  private proteccionesInternas: Proteccion[] = [];
  private villanoInterno: CartaVillano | null = null;

  constructor(heroe: CartaHeroe) {
    this.heroe = heroe;
  }

  get protecciones(): readonly Proteccion[] {
    return [...this.proteccionesInternas];
  }

  get villano(): CartaVillano | null {
    return this.villanoInterno;
  }

  get puntosProteccion(): number {
    return this.proteccionesInternas.reduce(
      (total, carta) => total + (carta instanceof CartaAliado ? 2 : 1),
      0,
    );
  }

  get estado(): EstadoHeroe {
    if (this.villanoInterno) return 'bloqueado';
    if (this.puntosProteccion >= 2) return 'blindado';
    if (this.puntosProteccion === 1) return 'protegido';
    return 'libre';
  }

  get estaPreparado(): boolean {
    return esEstadoPreparado(this.estado);
  }

  protegerCon(carta: Proteccion): void {
    if (this.villanoInterno) {
      throw new Error('Un héroe bloqueado debe ser liberado antes de protegerlo');
    }
    if (this.estado === 'blindado') {
      throw new Error('Un héroe blindado no admite más protección');
    }
    const compatible = carta instanceof CartaPoder
      ? poderCompatibleConHeroe(carta, this.heroe)
      : aliadoCompatibleConHeroe(carta, this.heroe);
    if (!compatible) throw new Error('La protección no es compatible con el héroe');
    if (this.puntosProteccion + (carta instanceof CartaAliado ? 2 : 1) > 2) {
      throw new Error('La protección excede el máximo del héroe');
    }
    this.proteccionesInternas.push(carta);
  }

  bloquearCon(villano: CartaVillano): Proteccion | null {
    if (this.estado === 'blindado') throw new Error('Un héroe blindado es inmune');
    if (this.villanoInterno) throw new Error('El héroe ya está bloqueado');
    if (!villanoCompatibleConHeroe(villano, this.heroe)) {
      throw new Error('El villano no es compatible con el héroe');
    }
    // Atacar a un héroe protegido destruye la protección y el villano se descarta.
    if (this.proteccionesInternas.length > 0) {
      return this.proteccionesInternas.pop() ?? null;
    }
    this.villanoInterno = villano;
    return null;
  }

  combatirCon(poder: CartaPoder): CartaVillano {
    if (!this.villanoInterno) throw new Error('El héroe no está bloqueado');
    if (!poderCompatibleConHeroe(poder, this.heroe)) {
      throw new Error('El poder no es compatible con el héroe');
    }
    const eliminado = this.villanoInterno;
    this.villanoInterno = null;
    return eliminado;
  }
}
