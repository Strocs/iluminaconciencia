'use client'

import { useCallback, type KeyboardEvent, type RefObject } from 'react'
import { LinkButton } from '@/_components/LinkButton'
import { getBortleClass } from '@/_shared/bortle/lookup'
import type { MapInstrument } from '../data/types'

const MONTHS: Record<string, string> = {
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

function formatSummaryPeriod(period: string) {
  const monthOnlyPeriod = period.trim().match(/^([a-z]{3,9})\s+(\d{4})$/i)
  if (monthOnlyPeriod) {
    const month = MONTHS[monthOnlyPeriod[1].slice(0, 3).toLowerCase()]
    return month ? `${month} de ${monthOnlyPeriod[2]}` : period
  }
  const date = new Date(period)
  if (Number.isNaN(date.getTime())) return period
  return new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
}

interface MapInstrumentDrawerProps {
  instrument: MapInstrument | null
  mobile: boolean
  inert: boolean
  closeButtonRef: RefObject<HTMLButtonElement | null>
  onClose: () => void
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
}

export function MapInstrumentDrawer({
  instrument,
  mobile,
  inert,
  closeButtonRef,
  onClose,
  onKeyDown
}: MapInstrumentDrawerProps) {
  const closeButtonContainerRef = useCallback(
    (node: HTMLElement | null) => {
      closeButtonRef.current = node?.querySelector<HTMLButtonElement>('[data-drawer-close]') ?? null
    },
    [closeButtonRef]
  )
  const open = instrument !== null
  const bortle = getBortleClass(instrument?.bortleLevel)
  const equipment = instrument
    ? [
        instrument.type,
        instrument.dataCount == null ? undefined : `${instrument.dataCount.toLocaleString('es-CL')} mediciones`,
        instrument.mag == null
          ? undefined
          : `${instrument.mag.toLocaleString('es-CL', { minimumFractionDigits: 2 })} mag/arcsec²`
      ]
        .filter(Boolean)
        .join(' · ')
    : ''
  const summary = instrument
    ? [
        instrument.summaryPeriod ? formatSummaryPeriod(instrument.summaryPeriod) : undefined,
        instrument.dataPercent == null
          ? undefined
          : `${instrument.dataPercent.toLocaleString('es-CL', { maximumFractionDigits: 2 })}% de datos`
      ]
        .filter(Boolean)
        .join(' · ')
    : ''
  const weather = instrument?.weather?.trim() ?? ''

  return (
    <aside
      id="instrument-drawer"
      ref={closeButtonContainerRef}
      aria-label={instrument?.name ?? 'Detalle del punto de medición'}
      role={mobile && open ? 'dialog' : undefined}
      aria-hidden={!open}
      aria-modal={mobile && open ? true : undefined}
      inert={inert}
      data-open={open ? '' : undefined}
      className="absolute inset-0 z-20 flex min-h-0 w-full shrink-0 translate-x-full flex-col self-stretch bg-background p-5 opacity-0 transition-transform duration-200 ease-in-out data-open:translate-x-0 data-open:opacity-100 motion-reduce:transition-none md:static md:inset-auto md:z-auto md:w-0 md:translate-x-2 md:bg-transparent md:p-0 md:pt-0 md:pl-0 md:transition-[width,padding,transform,opacity] md:data-open:w-55 md:data-open:translate-x-0 md:data-open:pt-8 md:data-open:pl-4 md:data-open:opacity-100"
      onKeyDown={onKeyDown}
    >
      <div className="border-b border-border pb-4">
        <h3 className="font-body text-base leading-tight font-bold text-primary">{instrument?.name}</h3>
      </div>
      <dl className="grid gap-3 border-b border-border py-4 text-sm/relaxed">
        {weather && (
          <div>
            <dt className="text-sm/relaxed font-semibold text-foreground">Clima</dt>
            <dd>{weather}</dd>
          </div>
        )}
        <div>
          <dt className="text-sm/relaxed font-semibold text-foreground">Equipo y mediciones</dt>
          <dd>{equipment}</dd>
        </div>
        {summary && (
          <div>
            <dt className="text-sm/relaxed font-semibold text-foreground">Resumen</dt>
            <dd>{summary}</dd>
          </div>
        )}
      </dl>
      {bortle && (
        <div className="min-h-28 border-b border-border py-3 text-sm/relaxed">
          <div className="flex items-center gap-3">
            <span className="rotate-180 text-xs font-semibold text-foreground [writing-mode:vertical-rl]">
              Nivel de Bortle
            </span>
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="font-body text-6xl leading-none font-bold text-foreground">{bortle.label}</span>
              <span
                aria-hidden="true"
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: bortle.color }}
              />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground">{bortle.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-text">
                SQM <span>{bortle.sqmRange}</span> mag/arcsec²
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="mt-auto space-y-4">
        <LinkButton
          href={instrument?.detailUrl ?? '#'}
          size="sm"
          className="h-8 w-full rounded-sm border border-primary bg-transparent py-1 text-primary hover:bg-transparent"
        >
          Más información
        </LinkButton>
        <LinkButton
          as="btn"
          size="sm"
          className="h-8 w-full rounded-sm border border-foreground bg-transparent py-1 text-foreground hover:bg-transparent"
          onClick={onClose}
          data-drawer-close
        >
          Cerrar
        </LinkButton>
      </div>
    </aside>
  )
}
