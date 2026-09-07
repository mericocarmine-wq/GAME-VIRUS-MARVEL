import type { Partida } from '../application/Partida';

export interface ConexionPartida {
  usuarioId: string;
  enviar(mensaje: string): void;
}

export class CanalPartidas {
  private readonly conexiones = new Map<string, Set<ConexionPartida>>();

  suscribir(partidaId: string, conexion: ConexionPartida): () => void {
    const conexiones = this.conexiones.get(partidaId) ?? new Set<ConexionPartida>();
    conexiones.add(conexion);
    this.conexiones.set(partidaId, conexiones);
    return () => {
      conexiones.delete(conexion);
      if (conexiones.size === 0) this.conexiones.delete(partidaId);
    };
  }

  publicar(
    partidaId: string,
    partida: Partida,
    serializar: (partida: Partida, usuarioId: string) => unknown,
  ): void {
    for (const conexion of this.conexiones.get(partidaId) ?? []) {
      conexion.enviar(
        JSON.stringify({
          tipo: 'partida.actualizada',
          partida: serializar(partida, conexion.usuarioId),
        }),
      );
    }
  }
}
