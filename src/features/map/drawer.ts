import type { Instrument } from '@shared/features/instruments'
import { getBortleClass } from '@shared/features/bortle'

export interface InstrumentDrawer {
  open(instrument: Instrument, returnFocus?: HTMLElement): void
  close(options?: { restoreFocus?: boolean }): void
  destroy(): void
}

export function createInstrumentDrawer(root: HTMLElement, onOpenChange?: (open: boolean) => void): InstrumentDrawer {
  const title = root.querySelector<HTMLElement>('[data-drawer-title]')
  const location = root.querySelector<HTMLElement>('[data-drawer-location]')
  const altitude = root.querySelector<HTMLElement>('[data-drawer-altitude]')
  const weather = root.querySelector<HTMLElement>('[data-drawer-weather]')
  const equipment = root.querySelector<HTMLElement>('[data-drawer-equipment]')
  const bortle = root.querySelector<HTMLElement>('[data-drawer-bortle]')
  const link = root.querySelector<HTMLAnchorElement>('[data-drawer-link]')
  const closeButton = root.querySelector<HTMLButtonElement>('[data-drawer-close]')
  if (!title || !location || !altitude || !weather || !equipment || !bortle || !link || !closeButton) {
    throw new Error('Instrument drawer is missing a required data attribute')
  }

  let returnFocus: HTMLElement | undefined
  let isOpen = false
  const setOpen = (open: boolean): void => {
    isOpen = open
    root.toggleAttribute('data-open', open)
    root.setAttribute('aria-hidden', String(!open))
    onOpenChange?.(open)
  }
  const close = ({ restoreFocus = true } = {}): void => {
    if (!isOpen) return
    setOpen(false)
    if (restoreFocus) returnFocus?.focus()
    returnFocus = undefined
  }
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') close()
  }
  closeButton.addEventListener('click', () => close())
  document.addEventListener('keydown', onKeyDown)

  return {
    open(instrument, trigger) {
      const canonical = getBortleClass(instrument.bortleLevel)
      returnFocus = trigger
      title.textContent = instrument.name
      location.textContent = `${instrument.location} · ${instrument.details.site}`
      altitude.textContent = `${instrument.details.altitude.toLocaleString('es-CL')} m s. n. m.`
      weather.textContent = instrument.details.weather
      equipment.textContent = `${instrument.type} · ${instrument.dataCount?.toLocaleString('es-CL') ?? 'Sin datos'} mediciones · ${instrument.mag?.toLocaleString('es-CL', { minimumFractionDigits: 2 }) ?? '—'} mag/arcsec²`
      bortle.replaceChildren()
      if (canonical) {
        const badge = document.createElement('span')
        badge.className = 'flex size-10 shrink-0 items-center justify-center rounded-full font-bold'
        badge.style.backgroundColor = canonical.color
        badge.style.color = canonical.textTone === 'dark' ? 'var(--color-background)' : 'var(--color-foreground)'
        badge.textContent = canonical.label
        const copy = document.createElement('span')
        copy.textContent = `${canonical.name}. Rango SQM: ${canonical.sqmRange} mag/arcsec².`
        bortle.append(badge, copy)
      }
      link.href = instrument.detailUrl ?? '#'
      setOpen(true)
      closeButton.focus()
    },
    close,
    destroy() {
      document.removeEventListener('keydown', onKeyDown)
    }
  }
}
