import { describe, it, expect } from 'vitest';
import { esEstadoPreparado, esInmune } from '../EstadoHeroe';

describe('EstadoHeroe', () => {
  it('libre, protegido y blindado cuentan como preparado', () => {
    expect(esEstadoPreparado('libre')).toBe(true);
    expect(esEstadoPreparado('protegido')).toBe(true);
    expect(esEstadoPreparado('blindado')).toBe(true);
  });

  it('bloqueado NUNCA cuenta como preparado', () => {
    expect(esEstadoPreparado('bloqueado')).toBe(false);
  });

  it('solo blindado es inmune', () => {
    expect(esInmune('blindado')).toBe(true);
    expect(esInmune('protegido')).toBe(false);
    expect(esInmune('libre')).toBe(false);
    expect(esInmune('bloqueado')).toBe(false);
  });
});
