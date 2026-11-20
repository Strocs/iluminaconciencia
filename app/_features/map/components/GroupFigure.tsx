import { cn } from '@/_utils/cn'
import type { MapGroup } from '../types'
import { MapMarkButton } from './MapMarkButton'

interface GroupFigureProps {
  group: MapGroup
  expanded: boolean
  selectedId: string | null
  onSelect: (group: MapGroup, trigger: HTMLElement, memberId?: string) => void
}

function slot(index: number, count: number, expanded: boolean) {
  if (count === 2) return { x: (index === 0 ? -1 : 1) * (expanded ? 28 : 9), y: 0 }
  return index === 0
    ? { x: 0, y: expanded ? -26 : -8 }
    : { x: (index === 1 ? -1 : 1) * (expanded ? 28 : 9), y: expanded ? 24 : 7 }
}

function compactGroupHitArea(members: MapGroup['members'], scale: number) {
  const margin = 2
  const bounds = members.map(({ instrumentType }, index) => {
    const { x, y } = slot(index, members.length, false)
    // Match MapMarkButton: 32px circle or 26px square, rotated for TESS-W.
    const size = instrumentType === 'SQC' ? 32 : instrumentType === 'TESS-W' ? 26 * Math.SQRT2 : 26
    const radius = (size * scale) / 2 + margin
    return { left: x - radius, right: x + radius, top: y - radius, bottom: y + radius }
  })
  const left = Math.min(...bounds.map((mark) => mark.left))
  const top = Math.min(...bounds.map((mark) => mark.top))

  return {
    left: `calc(50% + ${left}px)`,
    top: `calc(50% + ${top}px)`,
    width: Math.max(...bounds.map((mark) => mark.right)) - left,
    height: Math.max(...bounds.map((mark) => mark.bottom)) - top
  }
}

export function GroupFigure({ group, expanded, selectedId, onSelect }: GroupFigureProps) {
  const compactScale = group.members.length === 2 ? 0.75 : 0.6
  const scale = expanded ? 1 : compactScale

  return (
    <div className="pointer-events-none relative h-28 w-32">
      {group.members.map((mark, index) => {
        const position = slot(index, group.members.length, expanded)
        return (
          <div
            key={mark.id}
            inert={!expanded}
            aria-hidden={!expanded}
            className="pointer-events-none absolute top-1/2 left-1/2 flex size-8 -translate-1/2 items-center justify-center transition-transform duration-200 motion-reduce:transition-none"
            style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
          >
            <MapMarkButton
              mark={mark}
              selected={expanded && selectedId === mark.id}
              compact={!expanded}
              onSelect={(trigger) => onSelect(group, trigger, mark.id)}
            />
          </div>
        )
      })}
      <button
        type="button"
        data-map-group={group.id}
        aria-label={`Ver ${group.members.length} instrumentos: ${group.members.map(({ name }) => name).join(', ')}`}
        aria-expanded={expanded}
        aria-controls="mark-drawer"
        tabIndex={expanded ? -1 : 0}
        className={cn(
          'absolute z-10 cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground',
          expanded ? 'pointer-events-none invisible' : 'pointer-events-auto'
        )}
        style={compactGroupHitArea(group.members, compactScale)}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(group, event.currentTarget)
        }}
      />
    </div>
  )
}
