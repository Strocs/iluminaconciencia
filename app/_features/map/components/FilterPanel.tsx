'use client'

import { Button } from '@/_components/Button'
import { bortleClasses } from '@/_features/bortle/bortle-classes'
import { InfoPopover } from '@/_components/InfoPopover'
import { MapFilteredCount } from './FilteredCount'
import { useMapFilters } from '../hooks/useMapFilters'
import type { MapMark } from '../types'
import { BrandStarIcon } from '@/_components/BrandStarIcon'
import { cn } from '@/_utils/cn'

interface FilterPanelProps {
  floating?: boolean
  panelRef: React.Ref<HTMLElement>
  titleId: string
  panelId: string
  mobile: boolean
  filtersOpen: boolean
  onFiltersChanged: (marks: MapMark[]) => void
  onClose: () => void
}

export function FilterPanel({
  floating = false,
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
      className={cn(
        'absolute inset-0 z-20 flex min-h-0 w-full max-w-3/4 shrink-0 -translate-x-full flex-col gap-4 self-stretch rounded-lg border border-border bg-background p-4 transition-transform duration-200 ease-in-out data-open:translate-x-0 motion-reduce:transition-none md:static md:inset-auto md:max-w-54 md:translate-x-0! md:border-0 md:bg-transparent md:px-0 md:transition-none',
        floating &&
          'overflow-y-auto overscroll-contain md:absolute md:inset-y-3 md:left-3 md:w-64 md:max-w-64 md:border md:bg-background md:px-4'
      )}
      data-open={filtersOpen ? '' : undefined}
      onPointerDown={(event) => {
        if (mobile && event.target === event.currentTarget) onClose()
      }}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 id={titleId} className="text-xl font-medium text-primary">
            Filtros
          </h3>

          <Button
            as="btn"
            data-filter-close
            size="sm"
            aria-label="Cerrar filtros"
            onClick={onClose}
            className="md:hidden"
          >
            Cerrar
          </Button>
        </div>
        <p className="text-sm leading-snug font-light text-text">
          Filtra los fotómetros por escala de Bortle y tipo. Las cámaras SQC se seleccionan por separado.
        </p>
      </div>

      <fieldset className="space-y-2 border-t border-border">
        <legend className="flex w-full items-center gap-2 text-sm leading-tight text-foreground">
          <BrandStarIcon />
          <InfoPopover label="Escala de Bortle" trigger="Escala de Bortle" placement="bottom-right">
            <p className="font-light">
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
          <br />
          No se aplica a las cámaras SQC.
        </p>
      </fieldset>

      {[
        {
          label: 'Fotómetros',
          description:
            'Los fotómetros son instrumentos que miden la luz. TESS-W mide el brillo del cielo nocturno en una banda amplia (pancromática). TESS-4C utiliza cuatro canales físicos con distintas respuestas espectrales, lo que aporta información adicional sobre el color del cielo.',
          types: instrumentTypes.filter((type) => type !== 'SQC')
        },
        {
          label: 'Cámaras de cielo completo',
          description:
            'SQC (Sky Quality Camera) es un sistema que combina una cámara DSLR, una lente de ojo de pez y software de análisis para obtener una vista amplia del cielo. Permite analizar su brillo y color y, cuando la fuente de datos lo ofrece, estimar la cobertura de nubes.',
          types: instrumentTypes.filter((type) => type === 'SQC')
        }
      ].map(({ label, description, types }) => (
        <fieldset key={label} className="space-y-2 border-t border-border">
          <legend className="flex w-full items-center gap-2 text-sm leading-tight text-foreground">
            <BrandStarIcon />
            <InfoPopover label={label} trigger={label} placement="bottom-right">
              <p className="font-light">{description}</p>
            </InfoPopover>
          </legend>
          <div className="flex flex-col gap-2">
            {types.map((instrumentType) => (
              <button
                key={instrumentType}
                type="button"
                className="flex h-8 w-full min-w-0 items-center justify-center gap-2 rounded border border-primary bg-primary px-2 py-0 text-sm leading-none font-semibold text-background transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 aria-[pressed=false]:border-border aria-[pressed=false]:bg-background aria-[pressed=false]:text-text aria-[pressed=false]:hover:border-primary aria-[pressed=false]:hover:text-primary motion-reduce:transition-none motion-reduce:active:scale-100"
                aria-pressed={selectedInstrumentTypes.has(instrumentType)}
                onClick={() => onFiltersChanged(toggleInstrumentType(instrumentType))}
              >
                {instrumentType}
                <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 shrink-0" fill="currentColor">
                  {instrumentType === 'SQC' ? (
                    <circle cx="8" cy="8" r="5" />
                  ) : (
                    <rect
                      x="3"
                      y="3"
                      width="10"
                      height="10"
                      rx="1"
                      transform={instrumentType === 'TESS-W' ? 'rotate(45 8 8)' : undefined}
                    />
                  )}
                </svg>
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <div className="mt-auto space-y-2">
        <p className="mx-auto w-fit text-sm leading-none font-light text-text">
          <MapFilteredCount />
        </p>
        <Button as="btn" size="sm" className="w-full" onClick={() => onFiltersChanged(selectAll())}>
          Seleccionar todo
        </Button>
        <Button href="/medicion/tabla-de-datos" variant="important" size="sm" className="w-full">
          Tabla de datos
        </Button>
      </div>
    </aside>
  )
}
