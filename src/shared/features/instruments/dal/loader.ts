import mockRaw from './instruments.mock.json?raw'
import type { Instrument } from '../types'

/**
 * Loads instruments from the bundled mock JSON.
 *
 * Placeholder for the future data-access layer: the transport
 * (REST, direct connection, ...) is not defined yet, so this
 * function only parses the local mock through JSON.parse.
 */
export function loadInstruments(): Instrument[] {
  return JSON.parse(mockRaw) as Instrument[]
}