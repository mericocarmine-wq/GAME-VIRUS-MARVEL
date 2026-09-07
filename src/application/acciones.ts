import type { Carta } from '../domain/entities/Carta';
import type { Jugador } from '../domain/entities/Jugador';
import type { IdAccion } from '../domain/value-objects/TipoCarta';

export interface ContextoAccion {
  actor: Jugador;
  jugadores: readonly Jugador[];
}
export interface IEfectoAccion {
  readonly id: IdAccion;
  ejecutar(contexto: ContextoAccion, parametros: unknown): readonly Carta[];
}

export class RegistroAcciones {
  private readonly efectos = new Map<IdAccion, IEfectoAccion>();
  constructor(efectos: readonly IEfectoAccion[]) {
    efectos.forEach((efecto) => {
      if (this.efectos.has(efecto.id)) throw new Error(`Efecto duplicado: ${efecto.id}`);
      this.efectos.set(efecto.id, efecto);
    });
  }
  obtener(id: IdAccion): IEfectoAccion {
    const efecto = this.efectos.get(id);
    if (!efecto) throw new Error(`No hay efecto para ${id}`);
    return efecto;
  }
}

const objeto = (valor: unknown): Record<string, unknown> => {
  if (!valor || typeof valor !== 'object') throw new Error('Parámetros de acción inválidos');
  return valor as Record<string, unknown>;
};
const texto = (valor: Record<string, unknown>, clave: string): string => {
  const resultado = valor[clave];
  if (typeof resultado !== 'string' || !resultado.trim()) throw new Error(`Falta ${clave}`);
  return resultado;
};
const jugador = (jugadores: readonly Jugador[], id: string): Jugador => {
  const resultado = jugadores.find((actual) => actual.id === id);
  if (!resultado) throw new Error(`No existe el jugador ${id}`);
  return resultado;
};

class Reclutar implements IEfectoAccion {
  readonly id = 'reclutar' as const;
  ejecutar(contexto: ContextoAccion, parametros: unknown): readonly Carta[] {
    const datos = objeto(parametros);
    const origen = jugador(contexto.jugadores, texto(datos, 'jugadorOrigenId'));
    if (origen === contexto.actor) throw new Error('Reclutar requiere un rival');
    const heroeId = texto(datos, 'heroeId');
    const heroe = origen.zona.buscarHeroe(heroeId);
    if (!heroe) throw new Error(`No existe el héroe ${heroeId}`);
    if (heroe.estado === 'blindado') throw new Error('No se puede reclutar un héroe blindado');
    contexto.actor.zona.transferirHeroeDesde(origen.zona, heroeId);
    return [];
  }
}

class AlterarRealidad implements IEfectoAccion {
  readonly id = 'alterar-realidad' as const;
  ejecutar(contexto: ContextoAccion, parametros: unknown): readonly Carta[] {
    const objetivo = jugador(contexto.jugadores, texto(objeto(parametros), 'jugadorObjetivoId'));
    if (objetivo === contexto.actor) throw new Error('Hay que elegir otra persona');
    contexto.actor.zona.intercambiarCon(objetivo.zona);
    return [];
  }
}

class Chasquido implements IEfectoAccion {
  readonly id = 'chasquido' as const;
  ejecutar(contexto: ContextoAccion, parametros: unknown): readonly Carta[] {
    const selecciones = objeto(objeto(parametros).heroesPorJugador);
    for (const actual of contexto.jugadores) this.validar(actual, selecciones[actual.id]);
    return contexto.jugadores.flatMap((actual) =>
      (selecciones[actual.id] as string[]).flatMap(
        (id) => actual.zona.retirarHeroe(id).cartasEnJuego,
      ),
    );
  }
  private validar(jugadorActual: Jugador, seleccion: unknown): void {
    if (!Array.isArray(seleccion) || !seleccion.every((id) => typeof id === 'string'))
      throw new Error(`Falta selección de ${jugadorActual.nombre}`);
    if (seleccion.length !== Math.floor(jugadorActual.zona.heroes.length / 2))
      throw new Error(`${jugadorActual.nombre} debe elegir la mitad de sus héroes`);
    if (new Set(seleccion).size !== seleccion.length)
      throw new Error('Un héroe no puede elegirse dos veces');
    seleccion.forEach((id) => {
      if (!jugadorActual.zona.buscarHeroe(id)) throw new Error(`No existe el héroe ${id}`);
    });
  }
}

export const crearRegistroAcciones = (): RegistroAcciones =>
  new RegistroAcciones([new Reclutar(), new AlterarRealidad(), new Chasquido()]);
