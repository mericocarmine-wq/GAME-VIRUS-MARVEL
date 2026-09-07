import type { Carta } from '../domain/entities/Carta';
import { CartaAccion } from '../domain/entities/CartaAccion';
import { CartaAliado } from '../domain/entities/CartaAliado';
import { CartaHeroe } from '../domain/entities/CartaHeroe';
import { CartaPoder } from '../domain/entities/CartaPoder';
import { CartaVillano } from '../domain/entities/CartaVillano';
import { Jugador } from '../domain/entities/Jugador';
import type { Mazo } from '../domain/entities/Mazo';
import { PilaDescarte } from '../domain/entities/PilaDescarte';
import { crearRegistroAcciones, type RegistroAcciones } from './acciones';

export class Partida {
  private indiceTurno = 0;
  private ganadorInterno: Jugador | null = null;

  private constructor(
    private readonly jugadoresInternos: Jugador[],
    readonly mazo: Mazo,
    readonly descarte: PilaDescarte,
    private readonly acciones: RegistroAcciones,
  ) {}

  static iniciar(params: {
    jugadores: readonly Jugador[];
    mazo: Mazo;
    descarte?: PilaDescarte;
    acciones?: RegistroAcciones;
  }): Partida {
    if (params.jugadores.length < 2 || params.jugadores.length > 5) {
      throw new Error('La partida requiere entre dos y cinco jugadores');
    }
    const ids = params.jugadores.map(({ id }) => id);
    if (new Set(ids).size !== ids.length) {
      throw new Error('Los jugadores deben tener identificadores distintos');
    }
    if (params.jugadores.some(({ mano }) => mano.length > 0)) {
      throw new Error('Los jugadores deben iniciar con la mano vacía');
    }
    const necesarias = params.jugadores.length * Jugador.TAMANO_MANO;
    if (params.mazo.cantidad < necesarias) {
      throw new Error(`Se necesitan al menos ${necesarias} cartas para repartir`);
    }

    const partida = new Partida(
      [...params.jugadores],
      params.mazo,
      params.descarte ?? new PilaDescarte(),
      params.acciones ?? crearRegistroAcciones(),
    );
    for (const jugador of partida.jugadoresInternos) partida.reponerMano(jugador);
    return partida;
  }

  get jugadores(): readonly Jugador[] {
    return [...this.jugadoresInternos];
  }

  get jugadorActual(): Jugador {
    return this.jugadoresInternos[this.indiceTurno];
  }

  get ganador(): Jugador | null {
    return this.ganadorInterno;
  }

  jugarHeroe(jugadorId: string, cartaId: string): void {
    const jugador = this.validarTurno(jugadorId);
    const carta = this.cartaComo(jugador, cartaId, CartaHeroe, 'Héroe');
    jugador.zona.agregarHeroe(carta);
    jugador.retirarCarta(cartaId);
    this.finalizarTurno(jugador);
  }

  jugarAccion(jugadorId: string, cartaId: string, parametros: unknown): void {
    const jugador = this.validarTurno(jugadorId);
    const carta = this.cartaComo(jugador, cartaId, CartaAccion, 'Acción');
    const descartes = this.acciones
      .obtener(carta.idAccion)
      .ejecutar({ actor: jugador, jugadores: this.jugadoresInternos }, parametros);
    jugador.retirarCarta(cartaId);
    this.descarte.agregar(carta, ...descartes);
    this.finalizarTurno(jugador);
  }

  protegerHeroe(jugadorId: string, cartaId: string, heroeId: string): void {
    const jugador = this.validarTurno(jugadorId);
    const carta = jugador.obtenerCarta(cartaId);
    if (!(carta instanceof CartaPoder) && !(carta instanceof CartaAliado)) {
      throw new Error('Para proteger se necesita una carta de Poder o Aliado');
    }
    const heroe = jugador.zona.buscarHeroe(heroeId);
    if (!heroe) throw new Error(`No existe el héroe ${heroeId}`);
    heroe.protegerCon(carta);
    jugador.retirarCarta(cartaId);
    this.finalizarTurno(jugador);
  }

  jugarVillano(
    jugadorId: string,
    cartaId: string,
    jugadorObjetivoId: string,
    heroeId: string,
  ): void {
    const jugador = this.validarTurno(jugadorId);
    const carta = this.cartaComo(jugador, cartaId, CartaVillano, 'Villano');
    const objetivo = this.buscarJugador(jugadorObjetivoId);
    if (objetivo.id === jugador.id) {
      throw new Error('Los Villanos solo pueden jugarse contra un rival');
    }
    const heroe = objetivo.zona.buscarHeroe(heroeId);
    if (!heroe) throw new Error(`No existe el héroe ${heroeId}`);

    if (heroe.estado === 'bloqueado') {
      const captura = objetivo.zona.capturarHeroe(heroeId, carta);
      this.descarte.agregar(captura.heroe, ...captura.protecciones, ...captura.villanos);
    } else {
      const proteccionEliminada = heroe.bloquearCon(carta);
      if (proteccionEliminada) this.descarte.agregar(proteccionEliminada, carta);
    }
    jugador.retirarCarta(cartaId);
    this.finalizarTurno(jugador);
  }

  combatirVillano(jugadorId: string, cartaId: string, heroeId: string): void {
    const jugador = this.validarTurno(jugadorId);
    const carta = jugador.obtenerCarta(cartaId);
    if (!(carta instanceof CartaPoder) && !(carta instanceof CartaAliado)) {
      throw new Error('Para combatir se necesita una carta de Poder o Aliado');
    }
    const heroe = jugador.zona.buscarHeroe(heroeId);
    if (!heroe) throw new Error(`No existe el héroe ${heroeId}`);
    const villano = heroe.combatirCon(carta);
    jugador.retirarCarta(cartaId);
    this.descarte.agregar(carta, villano);
    this.finalizarTurno(jugador);
  }

  descartar(jugadorId: string, cartaIds: readonly string[]): void {
    const jugador = this.validarTurno(jugadorId);
    if (cartaIds.length === 0) throw new Error('Hay que descartar al menos una carta');
    if (new Set(cartaIds).size !== cartaIds.length) {
      throw new Error('No se puede descartar dos veces la misma carta');
    }
    cartaIds.forEach((id) => {
      jugador.obtenerCarta(id);
    });
    this.descarte.agregar(...cartaIds.map((id) => jugador.retirarCarta(id)));
    this.finalizarTurno(jugador);
  }

  private validarTurno(jugadorId: string): Jugador {
    if (this.ganadorInterno) throw new Error('La partida ya ha terminado');
    if (this.jugadorActual.id !== jugadorId) {
      throw new Error(`Es el turno de ${this.jugadorActual.nombre}`);
    }
    return this.jugadorActual;
  }

  private buscarJugador(id: string): Jugador {
    const jugador = this.jugadoresInternos.find((actual) => actual.id === id);
    if (!jugador) throw new Error(`No existe el jugador ${id}`);
    return jugador;
  }

  private cartaComo<T extends Carta>(
    jugador: Jugador,
    cartaId: string,
    tipo: abstract new (...args: never[]) => T,
    nombreTipo: string,
  ): T {
    const carta = jugador.obtenerCarta(cartaId);
    if (!(carta instanceof tipo)) {
      throw new Error(`La carta ${cartaId} no es de tipo ${nombreTipo}`);
    }
    return carta;
  }

  private finalizarTurno(jugador: Jugador): void {
    this.reponerMano(jugador);
    if (jugador.zona.haGanado()) {
      this.ganadorInterno = jugador;
      return;
    }
    this.indiceTurno = (this.indiceTurno + 1) % this.jugadoresInternos.length;
  }

  private reponerMano(jugador: Jugador): void {
    while (jugador.mano.length < Jugador.TAMANO_MANO) {
      let carta = this.mazo.robar();
      if (!carta && this.descarte.cantidad > 0) {
        this.mazo.reponer(this.descarte.vaciar());
        carta = this.mazo.robar();
      }
      if (!carta) return;
      jugador.recibir(carta);
    }
  }
}
