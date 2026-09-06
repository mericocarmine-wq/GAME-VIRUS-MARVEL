/**
 * Colores base del mazo. Multicolor e Intangible NO son colores:
 * son propiedades especiales de ciertas cartas (ver CartaHeroe).
 */
export const COLORES_BASE = ['rojo', 'amarillo', 'verde', 'azul'] as const;

export type Color = (typeof COLORES_BASE)[number];

export function esColorValido(valor: string): valor is Color {
  return (COLORES_BASE as readonly string[]).includes(valor);
}

/**
 * Un Villano multicolor (ej. Thanos) puede enfrentarse a un Héroe
 * de cualquier color base. Se modela como ausencia de color fijo,
 * no como un color más, para no ensuciar el enum de colores reales.
 */
export type ColorObjetivo = Color | 'cualquiera';
