'use client'

import { LinkButton } from '@/_components/LinkButton'
import { bortleClasses } from '@/_features/bortle/bortle-classes'
import { InfoPopover } from '@/_components/InfoPopover'
import { MapFilteredCount } from './FilteredCount'
import { useMapFilters } from '../hooks/useMapFilters'
import type { MapMark } from '../types'
import { BrandStarIcon } from '@/_components/BrandStarIcon'

interface FilterPanelProps {
  panelRef: React.Ref<HTMLElement>
  titleId: string
  panelId: string
  mobile: boolean
  filtersOpen: boolean
  onFiltersChanged: (marks: MapMark[]) => void
  onClose: () => void
}

export function FilterPanel({
  panelRef,
  titleId,
  panelId,
  mobile,
  filtersOpen,
  onFiltersChanged,
  onClose
}: FilterPanelProps) {
  const selectedLevels = useMapFilters((state) => state.selectedLevels)
  const selectedInstrumentTypes = useMapFilters((state) => state.selectedInstrumentTypes)
  const instrumentTypes = useMapFilters((state) => state.instrumentTypes)
  const toggleLevel = useMapFilters((state) => state.toggleLevel)
  const toggleInstrumentType = useMapFilters((state) => state.toggleInstrumentType)
  const selectAll = useMapFilters((state) => state.selectAll)

  return (
    <aside
      ref={panelRef}
      id={panelId}
      aria-label="Filtros del mapa"
      aria-labelledby={titleId}
      aria-hidden={mobile && !filtersOpen}
      inert={mobile && !filtersOpen}
      className="absolute inset-0 z-20 flex min-h-0 w-full max-w-3/4 shrink-0 -translate-x-full flex-col gap-4 self-stretch rounded-lg border border-border bg-background p-4 transition-transform duration-200 ease-in-out data-open:translate-x-0 motion-reduce:transition-none md:static md:inset-auto md:max-w-54 md:translate-x-0! md:border-0 md:bg-transparent md:px-0 md:transition-none"
      data-open={filtersOpen ? '' : undefined}
      onPointerDown={(event) => {
        if (mobile && event.target === event.currentTarget) onClose()
      }}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium text-primary">Filtros</h3>

          <LinkButton
            as="btn"
            data-filter-close
            size="sm"
            aria-label="Cerrar filtros"
            onClick={onClose}
            className="md:hidden"
          >
            Cerrar
          </LinkButton>
        </div>
        <p className="text-sm leading-snug font-light text-text">
          Acota las mediciones visibles filtrando por escala e instrumento
        </p>
      </div>

      <fieldset className="space-y-2 border-t border-border">
        <legend className="flex w-full items-center gap-2 text-sm leading-tight text-foreground">
          <BrandStarIcon /> <span>Escala de Bortle</span>
          <InfoPopover label="Información sobre la escala de Bortle" placement="bottom-right" size="sm">
            <p className="font-light">
              <strong>Qué es la Escala de Bortle?</strong> <br />
              La Escala de Bortle es un sistema de medición que clasifica la oscuridad del cielo nocturno en una escala
              del 1 al 9, donde 1 representa cielos extremadamente oscuros y 9 indica cielos muy brillantes y
              contaminados por la luz artificial. Esta escala es utilizada por astrónomos y observadores del cielo para
              evaluar la calidad de las condiciones de observación en diferentes ubicaciones.
            </p>
          </InfoPopover>
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {bortleClasses.toReversed().map((item) => (
            <button
              key={item.level}
              type="button"
              className="h-8 min-w-0 rounded border border-primary bg-primary px-1 py-0 text-sm leading-none font-semibold text-background transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 aria-[pressed=false]:border-border aria-[pressed=false]:bg-background aria-[pressed=false]:text-text aria-[pressed=false]:hover:border-primary aria-[pressed=false]:hover:text-primary motion-reduce:transition-none motion-reduce:active:scale-100"
              aria-pressed={selectedLevels.has(item.level)}
              onClick={() => onFiltersChanged(toggleLevel(item.level))}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="text-xs leading-normal font-light tracking-tight text-text">
          1: cielo excelente (más oscuro)
          <br />
          9: cielo muy afectado (más brillante)
        </p>
      </fieldset>

      <fieldset className="space-y-2 border-t border-border">
        <legend className="flex w-full items-center gap-2 text-sm leading-tight text-foreground">
          <BrandStarIcon />
          <span>Instrumentos</span>
          <InfoPopover label="Información sobre los instrumentos" placement="bottom-right" size="sm">
            <p className="font-light">
              <strong>SQC:</strong> Estación de observación terrestre que utiliza telescopios y otros instrumentos para
              medir la calidad del cielo nocturno y la contaminación lumínica en una ubicación específica. <br /> <br />
              <strong>TESS-4C:</strong> Instrumento <br /> <br />
              <strong>TESS-W:</strong> Instrumento
            </p>
          </InfoPopover>
        </legend>
        <div className="flex flex-col gap-2">
          {instrumentTypes.map((instrumentType) => (
            <button
              key={instrumentType}
              type="button"
              className="h-8 w-full min-w-0 rounded border border-primary bg-primary px-2 py-0 text-sm leading-none font-semibold text-background transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 aria-[pressed=false]:border-border aria-[pressed=false]:bg-background aria-[pressed=false]:text-text aria-[pressed=false]:hover:border-primary aria-[pressed=false]:hover:text-primary motion-reduce:transition-none motion-reduce:active:scale-100"
              aria-pressed={selectedInstrumentTypes.has(instrumentType)}
              onClick={() => onFiltersChanged(toggleInstrumentType(instrumentType))}
            >
              {instrumentType}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-auto space-y-2">
        <p className="mx-auto w-fit text-sm leading-none font-light text-text">
          <MapFilteredCount />
        </p>
        <LinkButton as="btn" size="sm" className="w-full" onClick={() => onFiltersChanged(selectAll())}>
          Seleccionar todo
        </LinkButton>
        <LinkButton href="/medicion/tabla-de-datos" variant="important" size="sm" className="w-full">
          Tabla de datos
        </LinkButton>
      </div>
    </aside>
  )
}
