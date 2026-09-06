import { afterEach, describe, expect, it } from 'vitest';
import { FastifyInstance } from 'fastify';
import { crearServidor } from '../servidor';

const servidores: FastifyInstance[] = [];
afterEach(async () => { await Promise.all(servidores.splice(0).map((servidor) => servidor.close())); });

function servidor() { const app = crearServidor(); servidores.push(app); return app; }

describe('API de partidas', () => {
  it('informa de salud y crea una partida con manos iniciales', async () => {
    const app = servidor();
    expect((await app.inject({ method: 'GET', url: '/salud' })).json()).toEqual({ estado: 'ok' });
    const respuesta = await app.inject({ method: 'POST', url: '/partidas', payload: { jugadores: [{ id: 'ana', nombre: 'Ana' }, { id: 'bob', nombre: 'Bob' }] } });
    expect(respuesta.statusCode).toBe(201);
    const cuerpo = respuesta.json() as { id: string; partida: { turnoDe: string; jugadores: { cartasEnMano: number }[] } };
    expect(cuerpo.id).toBeTruthy();
    expect(cuerpo.partida.turnoDe).toBe('ana');
    expect(cuerpo.partida.jugadores.every((jugador) => jugador.cartasEnMano === 3)).toBe(true);
  });

  it('rechaza partidas y jugadas inválidas con errores HTTP', async () => {
    const app = servidor();
    expect((await app.inject({ method: 'POST', url: '/partidas', payload: { jugadores: [] } })).statusCode).toBe(400);
    expect((await app.inject({ method: 'GET', url: '/partidas/inexistente' })).statusCode).toBe(401);
  });
});
