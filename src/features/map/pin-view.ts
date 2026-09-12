import type { Instrument } from '@shared/features/instruments'
import { getBortleClass } from '@shared/features/bortle'

export function renderPin(instrument: Instrument, selected = false): HTMLElement {
  const bortle = getBortleClass(instrument.bortleLevel)
  const pin = document.createElement('button')
  pin.type = 'button'
  pin.className = 'flex size-7 cursor-pointer items-center justify-center rounded-full border-2 font-mono text-[11px] font-bold shadow-lg transition-shadow hover:shadow-xl motion-reduce:transition-none'
  pin.dataset.instrumentId = instrument.id
  pin.setAttribute('aria-label', `Ver detalle de ${instrument.name}`)
  pin.setAttribute('aria-pressed', String(selected))
  pin.title = instrument.name
  pin.style.borderColor = bortle?.color ?? 'var(--color-primary)'
  pin.style.backgroundColor = selected ? (bortle?.color ?? 'var(--color-primary)') : '#111114'
  pin.style.color = selected && bortle?.textTone === 'dark' ? '#111114' : '#f5f0f2'
  pin.textContent = bortle?.label ?? '–'
  return pin
}
