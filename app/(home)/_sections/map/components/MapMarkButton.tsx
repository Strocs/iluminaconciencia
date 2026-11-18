import type { CSSProperties } from 'react'
import { getBortleClass } from '@/_features/bortle/lookup'
import { cn } from '@/_utils/cn'
import type { MapMark } from '../types'

interface MapMarkButtonProps {
  mark: MapMark
  selected: boolean
  compact?: boolean
  groupId?: string
  onSelect: (trigger: HTMLButtonElement) => void
}

export function MapMarkButton({ mark, selected, compact = false, groupId, onSelect }: MapMarkButtonProps) {
  const isCamera = mark.instrumentType === 'SQC'
  const isDiamond = mark.instrumentType === 'TESS-W'
  const bortle = isCamera ? undefined : getBortleClass(mark.bortleLevel)
  const label = bortle?.label ?? '–'
  const color = bortle?.color ?? 'var(--color-primary)'
  const textColor = bortle?.textTone === 'dark' ? '#111114' : 'var(--color-foreground)'

  return (
    <button
      type="button"
      data-map-group={groupId}
      aria-controls="mark-drawer"
      aria-label={`Ver detalle de ${mark.name}${isCamera ? ` · Cámara de cielo completo${mark.demoLocation ? ' · Demostración · Datos ficticios' : ''}` : ` · ${mark.instrumentType}`}`}
      aria-pressed={selected}
      aria-hidden={compact || undefined}
      tabIndex={compact ? -1 : undefined}
      className={cn(
        'shadow-[0_0_0_2px_#0a0718,0_2px_6px_#0009]',
        isCamera
          ? 'flex size-8 cursor-pointer items-center justify-center rounded-full border border-foreground font-bold transition-all hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none'
          : 'flex size-6.5 cursor-pointer items-center justify-center rounded-xs border border-dashed border-(--mark-color) text-lg leading-none font-bold tabular-nums transition-all hover:bg-(--mark-color) hover:text-(--mark-text) focus-visible:bg-(--mark-color) focus-visible:text-(--mark-text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none',
        isDiamond && 'rotate-45',
        isCamera
          ? selected
            ? 'bg-foreground text-background ring-2 ring-foreground ring-offset-2 ring-offset-background'
            : 'bg-[#111114] text-foreground'
          : selected
            ? 'border-solid bg-(--mark-color) text-(--mark-text) ring-2 ring-foreground ring-offset-2 ring-offset-background'
            : 'bg-[#111114] text-foreground',
        compact && 'pointer-events-none'
      )}
      style={{ '--mark-color': color, '--mark-text': textColor } as CSSProperties}
      onClick={(event) => {
        event.stopPropagation()
        if (!compact) onSelect(event.currentTarget)
      }}
    >
      {isCamera ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={cn('size-4', compact && 'invisible')}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.25}
        >
          <path d="M8 6 9.5 3h5L16 6h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      ) : (
        <span className={cn('pointer-events-none', isDiamond && '-rotate-45', compact && 'invisible')}>{label}</span>
      )}
    </button>
  )
}
