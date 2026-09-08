import { CartaHeroe } from './CartaHeroe';
import { CartaPoder } from './CartaPoder';
import { CartaVillano } from './CartaVillano';
import { CartaAliado } from './CartaAliado';
import { Color, esColorValido } from '../value-objects/Color';
import { EstadoHeroe } from '../value-objects/EstadoHeroe';
import { villanoCoincideConColor, aliadoCoincideConColor } from '../rules/ColorMatch';

/**
 * Representa un Héroe YA jugado en la mesa de un jugador, con todo
 * lo que tiene apilado encima. Esta es la pieza que en Fase 1 dejamos
 * pendiente a propósito: CartaHeroe es "qué es la carta", HeroeEnJuego
 * es "qué le está pasando ahora en la partida".
 *
 * Invariante de color para multicolor (Capitana Marvel): el color se
 * elige UNA vez, al jugar la carta, y no puede cambiar después. Por
 * eso `colorElegido` se recibe en el constructor y no hay ningún
 * método para modificarlo más tarde.
 */
export class HeroeEnJuego {
  readonly carta: CartaHeroe;
  private readonly colorElegido: Color | null;

  /** 0, 1 o 2 cartas de protección (Poder o Aliado) apiladas. */
  private protecciones: Array<CartaPoder | CartaAliado> = [];
  /** Solo presente si un Aliado blindó directamente (salta el paso intermedio). */
  private blindadoPorAliado = false;
  /** Presente únicamente si el héroe está bloqueado. */
  private villanoQueBloquea: CartaVillano | null = null;

  constructor(carta: CartaHeroe, colorElegido?: Color) {
    if (carta.esMulticolor) {
      if (!colorElegido || !esColorValido(colorElegido)) {
        throw new Error(
          `Héroe multicolor "${carta.nombre}" requiere un color elegido válido al jugarlo`,
        );
      }
    } else if (colorElegido) {
      throw new Error(
        `Héroe "${carta.nombre}" no es multicolor: no se le puede asignar un color elegido`,
      );
    }
    this.carta = carta;
    this.colorElegido = carta.esMulticolor ? colorElegido! : null;
  }

  /** Color real a efectos de reglas y de recuento de victoria. */
  colorEfectivo(): Color {
    return this.carta.esMulticolor ? this.colorElegido! : this.carta.color!;
  }

  estado(): EstadoHeroe {
    if (this.blindadoPorAliado || this.protecciones.length >= 2) return 'blindado';
    if (this.villanoQueBloquea) return 'bloqueado';
    if (this.protecciones.length === 1) return 'protegido';
    return 'libre';
  }

  esInmune(): boolean {
    return this.estado() === 'blindado';
  }

  // ---- Transiciones que inician los VILLANOS ----

  /** Bloquear: Villano sobre Héroe libre del mismo color (o multicolor). */
  bloquear(villano: CartaVillano): void {
    if (this.estado() !== 'libre') {
      throw new Error('Solo se puede bloquear un Héroe que esté libre');
    }
    if (!villanoCoincideConColor(villano, this.colorEfectivo())) {
      throw new Error('El Villano no coincide en color con el Héroe');
    }
    this.villanoQueBloquea = villano;
  }

  /** Debilitar: el Villano elimina la única carta de Poder que protege (no aplica si blindado). */
  debilitar(villano: CartaVillano): CartaPoder {
    if (this.estado() !== 'protegido') {
      throw new Error('Solo se puede debilitar un Héroe protegido (no libre, bloqueado ni blindado)');
    }
    const proteccion = this.protecciones[0];
    if (!(proteccion instanceof CartaPoder)) {
      throw new Error('La protección actual no es una carta de Poder debilitable');
    }
    if (proteccion.color !== villano.colorObjetivo && villano.colorObjetivo !== 'cualquiera') {
      throw new Error('El Villano no coincide en color con el Poder a debilitar');
    }
    this.protecciones = [];
    return proteccion;
  }

  /**
   * Capturar: un segundo Villano sobre un Héroe ya bloqueado.
   * Devuelve las cartas a enviar a descarte; quien llama (ZonaDeJuego)
   * es responsable de eliminar este Héroe de la mesa.
   */
  capturar(segundoVillano: CartaVillano): { heroe: CartaHeroe; villanos: [CartaVillano, CartaVillano] } {
    if (this.estado() !== 'bloqueado' || !this.villanoQueBloquea) {
      throw new Error('Solo se puede capturar un Héroe ya bloqueado');
    }
    if (!villanoCoincideConColor(segundoVillano, this.colorEfectivo())) {
      throw new Error('El segundo Villano no coincide en color con el Héroe bloqueado');
    }
    const primerVillano = this.villanoQueBloquea;
    return { heroe: this.carta, villanos: [primerVillano, segundoVillano] };
  }

  // ---- Transiciones que inician los PODERES ----

  /** Proteger: Poder sobre Héroe libre del mismo color. */
  proteger(poder: CartaPoder): void {
    if (this.estado() !== 'libre') {
      throw new Error('Solo se puede proteger un Héroe que esté libre');
    }
    if (poder.color !== this.colorEfectivo()) {
      throw new Error('El Poder no coincide en color con el Héroe');
    }
    this.protecciones.push(poder);
  }

  /** Combatir: Poder que descarta el Villano que bloquea. */
  combatir(poder: CartaPoder): CartaVillano {
    if (this.estado() !== 'bloqueado' || !this.villanoQueBloquea) {
      throw new Error('Solo se puede combatir un Héroe bloqueado');
    }
    if (poder.color !== this.colorEfectivo()) {
      throw new Error('El Poder no coincide en color con el Héroe bloqueado');
    }
    const villano = this.villanoQueBloquea;
    this.villanoQueBloquea = null;
    return villano;
  }

  /** Blindar con 2ª carta de Poder: solo si ya está protegido. */
  blindarConSegundoPoder(poder: CartaPoder): void {
    if (this.estado() !== 'protegido') {
      throw new Error('Solo se puede blindar con 2º Poder un Héroe ya protegido');
    }
    if (poder.color !== this.colorEfectivo()) {
      throw new Error('El Poder no coincide en color con el Héroe');
    }
    this.protecciones.push(poder);
  }

  // ---- Transiciones que inician los ALIADOS ----

  /** Atacar con Aliado: equivale a Combatir, pero con color entre los 2 del Aliado. */
  atacarConAliado(aliado: CartaAliado): CartaVillano {
    if (this.estado() !== 'bloqueado' || !this.villanoQueBloquea) {
      throw new Error('Solo se puede atacar con Aliado un Héroe bloqueado');
    }
    if (!aliadoCoincideConColor(aliado, this.colorEfectivo())) {
      throw new Error('El Aliado no cubre el color del Héroe bloqueado');
    }
    const villano = this.villanoQueBloquea;
    this.villanoQueBloquea = null;
    return villano;
  }

  /** Blindar con Aliado: directo, sobre Héroe libre o protegido, nunca intangible. */
  blindarConAliado(aliado: CartaAliado): void {
    if (this.carta.esIntangible) {
      throw new Error('Un Aliado no puede jugarse sobre un Héroe intangible');
    }
    const estadoActual = this.estado();
    if (estadoActual !== 'libre' && estadoActual !== 'protegido') {
      throw new Error('Solo se puede blindar con Aliado un Héroe libre o protegido');
    }
    if (!aliadoCoincideConColor(aliado, this.colorEfectivo())) {
      throw new Error('El Aliado no cubre el color del Héroe');
    }
    this.protecciones.push(aliado);
    this.blindadoPorAliado = true;
  }

  /**
   * Chasquido: destrucción total del héroe sin importar su estado.
   * Es la única Acción que ignora la inmunidad de blindado (regla
   * explícita del reglamento oficial).
   */
  destruirPorChasquido(): CartaHeroe {
    return this.carta;
  }
}