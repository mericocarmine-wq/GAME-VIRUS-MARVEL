import Fastify from 'fastify';
import { crearMazoInicial } from '../application/CrearMazoInicial';
import { Partida } from '../application/Partida';
import { Jugador } from '../domain/entities/Jugador';
import { IRepositorioPartidas, RepositorioPartidasMemoria } from '../infrastructure/RepositorioPartidasMemoria';

class ErrorHttp extends Error {
  constructor(readonly codigo: number, mensaje: string) { super(mensaje); }
}

export function crearServidor(repositorio: IRepositorioPartidas = new RepositorioPartidasMemoria()) {
  const app = Fastify({ logger: false });
  app.setErrorHandler((error, _request, reply) => reply.status(error instanceof ErrorHttp ? error.codigo : 400).send({
    error: error instanceof Error ? error.message : 'Error inesperado',
  }));

  app.get('/salud', async () => ({ estado: 'ok' }));
  app.post('/partidas', async (request, reply) => {
    const body = request.body as { jugadores?: { id?: string; nombre?: string }[] };
    if (!Array.isArray(body?.jugadores)) throw new Error('jugadores es obligatorio');
    const jugadores = body.jugadores.map(({ id, nombre }) => new Jugador({ id: id ?? '', nombre: nombre ?? '' }));
    const partida = Partida.iniciar({ jugadores, mazo: crearMazoInicial() });
    const id = crypto.randomUUID();
    repositorio.guardar(id, partida);
    return reply.status(201).send({ id, partida: serializar(partida) });
  });
  app.get('/partidas/:id', async (request) => serializar(obtener(repositorio, (request.params as { id: string }).id)));
  app.post('/partidas/:id/jugadas', async (request) => {
    const partida = obtener(repositorio, (request.params as { id: string }).id);
    const body = request.body as Record<string, unknown>;
    ejecutarJugada(partida, body);
    return serializar(partida);
  });
  return app;
}

function obtener(repositorio: IRepositorioPartidas, id: string): Partida {
  const partida = repositorio.obtener(id);
  if (!partida) throw new ErrorHttp(404, 'Partida no encontrada');
  return partida;
}

function ejecutarJugada(partida: Partida, body: Record<string, unknown>): void {
  const jugadorId = texto(body, 'jugadorId');
  const tipo = texto(body, 'tipo');
  const cartaId = texto(body, 'cartaId');
  if (tipo === 'heroe') partida.jugarHeroe(jugadorId, cartaId);
  else if (tipo === 'proteger') partida.protegerHeroe(jugadorId, cartaId, texto(body, 'heroeId'));
  else if (tipo === 'villano') partida.jugarVillano(jugadorId, cartaId, texto(body, 'jugadorObjetivoId'), texto(body, 'heroeId'));
  else if (tipo === 'combatir') partida.combatirVillano(jugadorId, cartaId, texto(body, 'heroeId'));
  else if (tipo === 'accion') partida.jugarAccion(jugadorId, cartaId, body.parametros);
  else if (tipo === 'descartar') partida.descartar(jugadorId, leerIds(body.cartaIds));
  else throw new Error('Tipo de jugada no válido');
}

function texto(body: Record<string, unknown>, clave: string): string {
  const valor = body[clave];
  if (typeof valor !== 'string' || !valor.trim()) throw new Error(`${clave} es obligatorio`);
  return valor;
}
function leerIds(valor: unknown): string[] {
  if (!Array.isArray(valor) || !valor.every((id) => typeof id === 'string')) throw new Error('cartaIds debe ser una lista de texto');
  return valor;
}
function serializar(partida: Partida) {
  return {
    turnoDe: partida.jugadorActual.id, ganador: partida.ganador?.id ?? null, descarte: partida.descarte.cantidad,
    jugadores: partida.jugadores.map((jugador) => ({ id: jugador.id, nombre: jugador.nombre, mano: jugador.mano.map(({ id, nombre, tipo }) => ({ id, nombre, tipo })), heroes: jugador.zona.heroes.map(({ heroe, estado }) => ({ id: heroe.id, nombre: heroe.nombre, estado })) })),
  };
}
