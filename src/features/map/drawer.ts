import type { Instrument } from '@shared/features/instruments'
import { getBortleClass } from '@shared/features/bortle'

const englishMonthToSpanish: Record<string, string> = {
  jan: 'enero',
  feb: 'febrero',
  mar: 'marzo',
  apr: 'abril',
  may: 'mayo',
  jun: 'junio',
  jul: 'julio',
  aug: 'agosto',
  sep: 'septiembre',
  oct: 'octubre',
  nov: 'noviembre',
  dec: 'diciembre'
}

function formatSummaryPeriod(period: string): string {
  const monthOnlyPeriod = period.trim().match(/^([a-z]{3,9})\s+(\d{4})$/i)
  if (monthOnlyPeriod) {
    const month = englishMonthToSpanish[monthOnlyPeriod[1].slice(0, 3).toLowerCase()]
    return month ? `${month} de ${monthOnlyPeriod[2]}` : period
  }

  const date = new Date(period)
  if (Number.isNaN(date.getTime())) return period
  return new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
}

export interface InstrumentDrawer {
  open(instrument: Instrument, returnFocus?: HTMLElement): void
  close(options?: { restoreFocus?: boolean }): void
  destroy(): void
}

export function createInstrumentDrawer(root: HTMLElement, onOpenChange?: (open: boolean) => void): InstrumentDrawer {
  const title = root.querySelector<HTMLElement>('[data-drawer-title]')
  const weatherRow = root.querySelector<HTMLElement>('[data-drawer-weather-row]')
  const weather = root.querySelector<HTMLElement>('[data-drawer-weather]')
  const equipment = root.querySelector<HTMLElement>('[data-drawer-equipment]')
  const summaryRow = root.querySelector<HTMLElement>('[data-drawer-summary-row]')
  const summary = root.querySelector<HTMLElement>('[data-drawer-summary]')
  const bortle = root.querySelector<HTMLElement>('[data-drawer-bortle]')
  const bortleLevel = root.querySelector<HTMLElement>('[data-bortle-level]')
  const bortleMarker = root.querySelector<HTMLElement>('[data-bortle-marker]')
  const bortleClassification = root.querySelector<HTMLElement>('[data-bortle-classification]')
  const bortleSqm = root.querySelector<HTMLElement>('[data-bortle-sqm]')
  const link = root.querySelector<HTMLAnchorElement>('[data-drawer-link]')
  const closeButton = root.querySelector<HTMLButtonElement>('[data-drawer-close]')
  if (
    !title || !weatherRow || !weather || !equipment || !summaryRow || !summary || !bortle || !bortleLevel ||
    !bortleMarker || !bortleClassification || !bortleSqm || !link || !closeButton
  ) {
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
      const weatherValue = instrument.details.weather?.trim()
      weather.textContent = weatherValue ?? ''
      weatherRow.hidden = !weatherValue
      const equipmentDetails = [
        instrument.type,
        instrument.dataCount == null ? undefined : `${instrument.dataCount.toLocaleString('es-CL')} mediciones`,
        instrument.mag == null ? undefined : `${instrument.mag.toLocaleString('es-CL', { minimumFractionDigits: 2 })} mag/arcsec²`
      ].filter(Boolean)
      equipment.textContent = equipmentDetails.join(' · ')
      const summaryPeriod = instrument.summaryPeriod ? formatSummaryPeriod(instrument.summaryPeriod) : undefined
      const dataPercent = instrument.dataPercent?.toLocaleString('es-CL', { maximumFractionDigits: 2 })
      const summaryDetails = [summaryPeriod, dataPercent == null ? undefined : `${dataPercent}% de datos`].filter(Boolean)
      const summaryValue = summaryDetails.join(' · ')
      summary.textContent = summaryValue
      summaryRow.hidden = !summaryValue
      bortle.hidden = !canonical
      if (canonical) {
        bortleLevel.textContent = canonical.label
        bortleMarker.style.backgroundColor = canonical.color
        bortleClassification.textContent = canonical.name
        bortleSqm.textContent = canonical.sqmRange
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
