import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases con clsx y resuelve conflictos de utilidades con tailwind-merge.
 * Acepta cadenas, arrays y objetos condicionales; omite valores falsos.
 * Entre utilidades incompatibles, prevalece la última.
 *
 * @example cn('px-4', { 'px-6': true }) // 'px-6'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
