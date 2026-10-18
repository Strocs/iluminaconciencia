'use client'

import { useCallback, type RefObject } from 'react'
import { LinkButton } from '@/_components/LinkButton'
import { getBortleClass } from '@/_features/bortle/lookup'
import type { MapMark } from '../types'

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

interface MapMarkDrawerProps {
  mark: MapMark | null
  open: boolean
  mobile: boolean
  inert: boolean
  closeButtonRef: RefObject<HTMLButtonElement | null>
  onClose: () => void
}

export function MapMarkDrawer({ mark, open, mobile, inert, closeButtonRef, onClose }: MapMarkDrawerProps) {
  const closeButtonContainerRef = useCallback(
    (node: HTMLElement | null) => {
      closeButtonRef.current = node?.querySelector<HTMLButtonElement>('[data-drawer-close]') ?? null
    },
    [closeButtonRef]
  )
  const bortle = getBortleClass(mark?.bortleLevel)
  const equipment = mark
    ? [
        mark.instrumentType,
        mark.dataCount == null ? undefined : `${mark.dataCount.toLocaleString('es-CL')} mediciones`,
        mark.mag == null ? undefined : `${mark.mag.toLocaleString('es-CL', { minimumFractionDigits: 2 })} mag/arcsec²`
      ]
        .filter(Boolean)
        .join(' · ')
    : ''
  const summary = mark
    ? [
        mark.summaryPeriod ? formatSummaryPeriod(mark.summaryPeriod) : undefined,
        mark.dataPercent == null
          ? undefined
          : `${mark.dataPercent.toLocaleString('es-CL', { maximumFractionDigits: 2 })}% de datos`
      ]
        .filter(Boolean)
        .join(' · ')
    : ''
  const weather = mark?.weather?.trim() ?? ''

  return (
    <div
      aria-hidden={!open}
      data-open={open ? '' : undefined}
      className="pointer-events-none absolute inset-y-0 right-0 left-auto z-20 w-full md:static md:inset-auto md:z-auto md:flex md:w-0 md:flex-none md:justify-end md:overflow-hidden md:transition-[width] md:duration-200 md:ease-in-out md:data-open:w-[calc(var(--drawer-width)+var(--drawer-gap))] md:motion-reduce:transition-none md:motion-reduce:duration-0"
    >
      <aside
        id="mark-drawer"
        ref={closeButtonContainerRef}
        aria-label={mark?.name ?? 'Detalle del punto de medición'}
        role={mobile && open ? 'dialog' : undefined}
        aria-modal={mobile && open ? true : undefined}
        inert={inert}
        data-open={open ? '' : undefined}
        className="pointer-events-none absolute inset-y-0 right-0 left-auto flex min-h-0 w-full max-w-3/4 shrink-0 translate-x-full flex-col self-stretch overflow-hidden rounded-lg border border-border bg-background p-4 transition-[translate] duration-200 ease-in-out data-open:pointer-events-auto data-open:translate-x-0 motion-reduce:transition-none motion-reduce:duration-0 md:static md:w-(--drawer-width) md:max-w-none md:translate-x-0 md:rounded-none md:border-0 md:bg-transparent md:px-0 md:transition-none"
      >
        <div className="border-b border-border pb-4">
          <h3 className="font-body text-base leading-tight font-bold text-primary">{mark?.name}</h3>
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
        <div className="mt-auto space-y-2">
          <LinkButton href={mark ? `/medicion/${encodeURIComponent(mark.id)}` : '/medicion'} variant="important" size="sm" className="w-full">
            Más información
          </LinkButton>
          <LinkButton as="btn" size="sm" onClick={onClose} data-drawer-close className="w-full">
            Cerrar
          </LinkButton>
        </div>
      </aside>
    </div>
  )
}
