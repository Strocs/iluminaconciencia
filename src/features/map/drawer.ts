import type { Instrument } from '@shared/features/instruments'

export interface InstrumentDrawer {
  open(instrument: Instrument): void
  close(): void
}

interface DrawerRow {
  label: string
  value: string
}

/** Builds the visible rows: fields with a value only, in display order. */
function instrumentRows(instrument: Instrument): DrawerRow[] {
  const rows: DrawerRow[] = [
    { label: 'Localidad', value: instrument.location },
    { label: 'Tipo', value: instrument.type }
  ]
  if (instrument.bortleLevel !== null) {
    rows.push({ label: 'Escala Bortle', value: String(instrument.bortleLevel) })
  }
  if (instrument.mag !== null) {
    rows.push({
      label: 'Magnitud media',
      value: instrument.mag.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    })
  }
  if (instrument.dataCount !== null) {
    rows.push({ label: 'Cantidad de datos', value: instrument.dataCount.toLocaleString('es-CL') })
  }
  return rows
}

export function createInstrumentDrawer(root: HTMLElement): InstrumentDrawer {
  const title = root.querySelector<HTMLElement>('[data-drawer-title]')
  const rows = root.querySelector<HTMLElement>('[data-drawer-rows]')
  const link = root.querySelector<HTMLAnchorElement>('[data-drawer-link]')
  const closeButton = root.querySelector<HTMLButtonElement>('[data-drawer-close]')

  if (!title || !rows || !link || !closeButton) {
    throw new Error('Instrument drawer is missing a required data attribute')
  }

  const setOpen = (open: boolean): void => {
    root.classList.toggle('translate-x-0', open)
    root.classList.toggle('translate-x-full', !open)
    root.classList.toggle('pointer-events-none', !open)
    root.setAttribute('aria-hidden', String(!open))
  }

  const close = (): void => {
    setOpen(false)
  }

  closeButton.addEventListener('click', close)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close()
  })

  return {
    open(instrument) {
      title.textContent = instrument.name
      rows.replaceChildren(
        ...instrumentRows(instrument).map(({ label, value }) => {
          const row = document.createElement('div')
          row.className = 'flex items-baseline justify-between gap-4 border-b border-border pb-2'
          const dt = document.createElement('dt')
          dt.className = 'text-sm text-text'
          dt.textContent = label
          const dd = document.createElement('dd')
          dd.className = 'text-sm font-medium text-foreground'
          dd.textContent = value
          row.append(dt, dd)
          return row
        })
      )
      if (instrument.detailUrl) {
        link.href = instrument.detailUrl
        link.hidden = false
      } else {
        link.hidden = true
      }
      setOpen(true)
    },
    close
  }
}
