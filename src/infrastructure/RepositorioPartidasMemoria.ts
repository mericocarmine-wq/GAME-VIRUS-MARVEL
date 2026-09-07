import type { Partida } from '../application/Partida';

export interface IRepositorioPartidas {
  guardar(id: string, partida: Partida): void;
  obtener(id: string): Partida | undefined;
}

export class RepositorioPartidasMemoria implements IRepositorioPartidas {
  private readonly partidas = new Map<string, Partida>();
  guardar(id: string, partida: Partida): void {
    this.partidas.set(id, partida);
  }
  obtener(id: string): Partida | undefined {
    return this.partidas.get(id);
  }
}
