import { describe, expect, it } from 'vitest';
import { CartaPoder } from '../CartaPoder';
import { Mazo } from '../Mazo';
import { IBarajador } from '../../services/IBarajador';

class SinBarajar implements IBarajador {
  barajar<T>(elementos: readonly T[]): T[] {
    return [...elementos];
  }
}

const carta = (id: string) => new CartaPoder({ id, nombre: id, color: 'rojo' });

describe('Mazo', () => {
  it('delega el orden y roba una carta cada vez', () => {
    const mazo = new Mazo([carta('1'), carta('2')], new SinBarajar());
    expect(mazo.robar()?.id).toBe('2');
    expect(mazo.cantidad).toBe(1);
  });

  it('rechaza identificadores duplicados', () => {
    expect(() => new Mazo([carta('1'), carta('1')])).toThrow('repetidos');
  });
});
