'use client'

import type { RefObject } from 'react'
import { Button } from '@/_components/Button'
import { getBortleClass } from '@/_features/bortle/lookup'
import { MONTHS } from '@/_utils/months'
import { cn } from '@/_utils/cn'
import type { MapMark } from '../types'

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
  floating?: boolean
  marks: MapMark[]
  selectedId: string | null
  open: boolean
  mobile: boolean
  inert: boolean
  closeButtonRef: RefObject<HTMLButtonElement | null>
  listRef: RefObject<HTMLDivElement | null>
  onClose: () => void
}

function MemberArticle({ mark, selected, floating }: { mark: MapMark; selected: boolean; floating: boolean }) {
  const isCamera = mark.instrumentType === 'SQC'
  const bortle = isCamera ? undefined : getBortleClass(mark.bortleLevel)
  const equipment = [
    mark.instrumentType,
    mark.dataCount == null ? undefined : `${mark.dataCount.toLocaleString('es-CL')} mediciones`,
    mark.mag == null ? undefined : `${mark.mag.toLocaleString('es-CL', { minimumFractionDigits: 2 })} mag/arcsec²`
  ]
    .filter(Boolean)
    .join(' · ')
  const summary = [
    mark.summaryPeriod ? formatSummaryPeriod(mark.summaryPeriod) : undefined,
    mark.dataPercent == null
      ? undefined
      : `${mark.dataPercent.toLocaleString('es-CL', { maximumFractionDigits: 2 })}% de datos`
  ]
    .filter(Boolean)
    .join(' · ')
  const weather = mark.weather?.trim() ?? ''

  return (
    <article
      tabIndex={-1}
      data-map-member={mark.id}
      aria-label={mark.name}
      className={cn(
        'scroll-my-2 border border-transparent p-2 text-sm/relaxed focus-visible:outline-2 focus-visible:outline-primary',
        selected && 'border-border bg-primary/5',
        selected && !floating ? 'rounded-md' : 'rounded-lg'
      )}
    >
      <h4 className="border-b border-border pb-3 font-body text-base leading-tight font-bold text-primary">
        {mark.name}
      </h4>
      {isCamera ? (
        <div className="grid gap-3 border-b border-border py-4 text-sm/relaxed">
          <p className="font-semibold text-foreground">SQC · Lorem ipsum</p>
          <dl className="grid gap-3">
            <div>
              <dt className="font-semibold text-foreground">Categoría</dt>
              <dd>Cámara de cielo completo · SQC</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Ubicación aproximada</dt>
              <dd>Lorem ipsum dolor sit amet.</dd>
            </div>
          </dl>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </p>
        </div>
      ) : (
        <dl className="grid gap-3 border-b border-border py-4 text-sm/relaxed">
          {weather && (
            <div>
              <dt className="font-semibold text-foreground">Clima</dt>
              <dd>{weather}</dd>
            </div>
          )}
          <div>
            <dt className="font-semibold text-foreground">Equipo y mediciones</dt>
            <dd>{equipment}</dd>
          </div>
          {summary && (
            <div>
              <dt className="font-semibold text-foreground">Resumen</dt>
              <dd>{summary}</dd>
            </div>
          )}
        </dl>
      )}
      {bortle && (
        <div className="min-h-28 border-b border-border py-3 text-sm/relaxed">
          <div className="flex items-start gap-3">
            <span className="rotate-180 text-xs font-semibold text-foreground [writing-mode:vertical-rl]">
              Nivel de Bortle
            </span>
            <div className="flex flex-col items-center gap-1">
              <span className="font-body text-6xl/[0.9] font-bold text-foreground">{bortle.label}</span>
              <span
                aria-hidden="true"
                className="size-5 shrink-0 rounded-full"
                style={{ backgroundColor: bortle.color }}
              />
            </div>
            <div className="min-w-0">
              <p className="leading-tight font-semibold text-foreground">{bortle.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-text">
                SQM <span>{bortle.sqmRange}</span> mag/arcsec²
              </p>
            </div>
          </div>
        </div>
      )}
      {!isCamera && mark.detailHref !== null && (
        <Button
          href={mark.detailHref ?? `/medicion/${encodeURIComponent(mark.id)}`}
          variant="important"
          size="sm"
          className="mt-3 w-full"
        >
          Más información<span className="sr-only"> de {mark.name}</span>
        </Button>
      )}
    </article>
  )
}

export function MapMarkDrawer({
  floating = false,
  marks,
  selectedId,
  open,
  mobile,
  inert,
  closeButtonRef,
  listRef,
  onClose
}: MapMarkDrawerProps) {
  return (
    <div
      aria-hidden={!open}
      data-open={open ? '' : undefined}
      className={cn(
        'pointer-events-none absolute inset-y-0 right-0 left-auto z-20 w-full md:static md:inset-auto md:z-auto md:flex md:w-0 md:flex-none md:justify-end md:overflow-hidden md:transition-[width] md:duration-200 md:ease-in-out md:data-open:w-[calc(var(--drawer-width)+var(--drawer-gap))] md:motion-reduce:transition-none md:motion-reduce:duration-0',
        floating &&
          'md:absolute md:inset-y-3 md:right-3 md:left-auto md:z-20 md:w-(--drawer-width) md:overflow-clip md:transition-none md:data-open:w-(--drawer-width)'
      )}
    >
      <aside
        id="mark-drawer"
        aria-label={marks.length === 1 ? marks[0].name : 'Detalles de los instrumentos agrupados'}
        role={mobile && open ? 'dialog' : undefined}
        aria-modal={mobile && open ? true : undefined}
        inert={inert}
        data-open={open ? '' : undefined}
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 left-auto flex min-h-0 w-full max-w-3/4 shrink-0 translate-x-full flex-col self-stretch overflow-hidden rounded-lg border border-border bg-background p-4 transition-[translate] duration-200 ease-in-out data-open:pointer-events-auto data-open:translate-x-0 motion-reduce:transition-none motion-reduce:duration-0 md:static md:w-(--drawer-width) md:max-w-none md:translate-x-0 md:rounded-none md:border-0 md:bg-transparent md:px-0 md:transition-none',
          floating &&
            'md:absolute md:inset-0 md:w-full md:translate-x-full md:rounded-lg md:border md:bg-background md:px-4 md:transition-[translate] md:duration-200 md:data-open:translate-x-0'
        )}
      >
        <h3 className="shrink-0 border-b border-border pb-3 font-body text-base font-normal text-primary">
          {marks.length > 1 ? `${marks.length} instrumentos en este punto` : 'Detalle del instrumento'}
        </h3>
        <div ref={listRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain py-3">
          {marks.map((mark) => (
            <MemberArticle key={mark.id} mark={mark} selected={selectedId === mark.id} floating={!!floating} />
          ))}
        </div>
        <Button
          as="btn"
          ref={closeButtonRef}
          size="sm"
          onClick={onClose}
          data-drawer-close
          className="mt-2 w-full shrink-0"
        >
          Cerrar
        </Button>
      </aside>
    </div>
  )
}
