import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import { crearMazoInicial } from '../application/CrearMazoInicial';
import { Partida } from '../application/Partida';
import { Jugador } from '../domain/entities/Jugador';
import { IRepositorioPartidas, RepositorioPartidasMemoria } from '../infrastructure/RepositorioPartidasMemoria';
import { RepositorioUsuariosMemoria } from '../infrastructure/RepositorioUsuariosMemoria';
import { CanalPartidas } from './CanalPartidas';

class ErrorHttp extends Error {
  constructor(readonly codigo: number, mensaje: string) { super(mensaje); }
}

export function crearServidor(repositorio: IRepositorioPartidas = new RepositorioPartidasMemoria(), usuarios = new RepositorioUsuariosMemoria()) {
  const app = Fastify({ logger: false });
  app.register(jwt, { secret: process.env.JWT_SECRET ?? 'solo-desarrollo-cambia-este-secreto' });
  app.register(websocket);
  const canal = new CanalPartidas();
  app.setErrorHandler((error, _request, reply) => reply.status(error instanceof ErrorHttp ? error.codigo : (typeof (error as { statusCode?: unknown }).statusCode === 'number' ? (error as { statusCode: number }).statusCode : 400)).send({
    error: error instanceof Error ? error.message : 'Error inesperado',
  }));

  app.get('/salud', async () => ({ estado: 'ok' }));
  app.post('/auth/registro', async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const usuario = usuarios.crear(texto(body, 'nombre'), texto(body, 'contrasena'));
    return reply.status(201).send({ id: usuario.id, token: app.jwt.sign({ sub: usuario.id, nombre: usuario.nombre }) });
  });
  app.post('/auth/login', async (request) => {
    const body = request.body as Record<string, unknown>;
    const usuario = usuarios.autenticar(texto(body, 'nombre'), texto(body, 'contrasena'));
    if (!usuario) throw new ErrorHttp(401, 'Credenciales inválidas');
    return { id: usuario.id, token: app.jwt.sign({ sub: usuario.id, nombre: usuario.nombre }) };
  });
  app.post('/partidas', async (request, reply) => {
    const body = request.body as { jugadores?: { id?: string; nombre?: string }[] };
    if (!Array.isArray(body?.jugadores)) throw new Error('jugadores es obligatorio');
    const jugadores = body.jugadores.map(({ id, nombre }) => new Jugador({ id: id ?? '', nombre: nombre ?? '' }));
    const partida = Partida.iniciar({ jugadores, mazo: crearMazoInicial() });
    const id = crypto.randomUUID();
    repositorio.guardar(id, partida);
    return reply.status(201).send({ id, partida: serializar(partida) });
  });
  app.get('/partidas/:id', { onRequest: [autenticar] }, async (request) => serializar(obtener(repositorio, (request.params as { id: string }).id), idUsuario(request.user)));
  app.get('/partidas/:id/eventos', { websocket: true }, (socket, request) => {
    const token = (request.query as { token?: string }).token;
    let usuarioId: string;
    try { usuarioId = idUsuario(app.jwt.verify(token ?? '')); } catch { socket.close(1008, 'No autorizado'); return; }
    const partidaId = (request.params as { id: string }).id;
    const partida = repositorio.obtener(partidaId);
    if (!partida) { socket.close(1008, 'Partida no encontrada'); return; }
    const cancelar = canal.suscribir(partidaId, { usuarioId, enviar: (mensaje) => socket.send(mensaje) });
    socket.send(JSON.stringify({ tipo: 'partida.actualizada', partida: serializar(partida, usuarioId) }));
    socket.on('close', cancelar);
  });
  app.post('/partidas/:id/jugadas', { onRequest: [autenticar] }, async (request) => {
    const partida = obtener(repositorio, (request.params as { id: string }).id);
    const body = request.body as Record<string, unknown>;
    if (texto(body, 'jugadorId') !== idUsuario(request.user)) throw new ErrorHttp(403, 'No puedes jugar por otro jugador');
    ejecutarJugada(partida, body);
    canal.publicar((request.params as { id: string }).id, partida, serializar);
    return serializar(partida);
  });
  return app;
}

async function autenticar(request: { jwtVerify: () => Promise<unknown> }): Promise<void> { await request.jwtVerify(); }
function idUsuario(valor: unknown): string {
  if (!valor || typeof valor !== 'object' || typeof (valor as { sub?: unknown }).sub !== 'string') throw new ErrorHttp(401, 'Token inválido');
  return (valor as { sub: string }).sub;
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
export function serializar(partida: Partida, usuarioId?: string) {
  return {
    turnoDe: partida.jugadorActual.id, ganador: partida.ganador?.id ?? null, descarte: partida.descarte.cantidad,
    jugadores: partida.jugadores.map((jugador) => ({ id: jugador.id, nombre: jugador.nombre, mano: jugador.id === usuarioId ? jugador.mano.map(({ id, nombre, tipo }) => ({ id, nombre, tipo })) : undefined, cartasEnMano: jugador.mano.length, heroes: jugador.zona.heroes.map(({ heroe, estado }) => ({ id: heroe.id, nombre: heroe.nombre, estado })) })),
  };
}
