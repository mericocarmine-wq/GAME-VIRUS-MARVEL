import { TipoCarta } from '../value-objects/TipoCarta';

/**
 * Identidad mínima compartida por toda carta del mazo.
 * Cada subtipo añade sus propios invariantes en su propio archivo
 * (SRP: un archivo por concepto, no un "God object" Carta con
 * todos los campos opcionales de todas las familias).
 */
export abstract class Carta {
  readonly id: string;
  readonly tipo: TipoCarta;
  readonly nombre: string;

  protected constructor(id: string, tipo: TipoCarta, nombre: string) {
    if (!id.trim()) throw new Error('Una carta debe tener id');
    if (!nombre.trim()) throw new Error('Una carta debe tener nombre');
    this.id = id;
    this.tipo = tipo;
    this.nombre = nombre;
  }
}
