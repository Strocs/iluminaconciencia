import type { Instrument } from '@shared/features/instruments'
import { getBortleClass } from '@shared/features/bortle'

const PIN_SVG =
  '<svg width="28" height="36" viewBox="0 0 28 36" fill="none" aria-hidden="true">' +
  '<path d="M14 0C6.27 0 0 6.27 0 14c0 9.8 14 22 14 22s14-12.2 14-22C28 6.27 21.73 0 14 0z" fill="currentColor"/>' +
  '<circle cx="14" cy="14" r="6" fill="var(--color-background)"/>' +
  '</svg>'

/**
 * Renders the pin DOM for an instrument.
 *
 * Uses the shared Bortle color when the instrument has a known level;
 * instruments without a measurement retain the accent color.
 */
export function renderPin(instrument: Instrument): HTMLElement {
  const pin = document.createElement('button')
  pin.type = 'button'
  pin.className = 'flex cursor-pointer items-center justify-center drop-shadow-md'
  pin.setAttribute('aria-label', instrument.name)
  pin.title = instrument.name
  pin.style.color = getBortleClass(instrument.bortleLevel)?.color ?? 'var(--color-accent)'
  pin.innerHTML = PIN_SVG
  return pin
}
