/** Puerto inyectable para mantener el azar fuera de las reglas de dominio. */
export interface IBarajador {
  barajar<T>(elementos: readonly T[]): T[];
}

export class BarajadorAleatorio implements IBarajador {
  barajar<T>(elementos: readonly T[]): T[] {
    const resultado = [...elementos];
    for (let i = resultado.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
    }
    return resultado;
  }
}
