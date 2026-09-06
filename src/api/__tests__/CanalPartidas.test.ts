import { describe, expect, it } from 'vitest';
import { CanalPartidas } from '../CanalPartidas';
import { Partida } from '../../application/Partida';

describe('CanalPartidas', () => {
  it('publica a suscriptores y deja de hacerlo tras cancelar', () => {
    const canal = new CanalPartidas();
    const mensajes: string[] = [];
    const cancelar = canal.suscribir('p1', { usuarioId: 'u1', enviar: (mensaje) => mensajes.push(mensaje) });
    canal.publicar('p1', {} as Partida, (_partida, usuarioId) => ({ usuarioId }));
    expect(JSON.parse(mensajes[0])).toEqual({ tipo: 'partida.actualizada', partida: { usuarioId: 'u1' } });
    cancelar();
    canal.publicar('p1', {} as Partida, () => ({}));
    expect(mensajes).toHaveLength(1);
  });
});
