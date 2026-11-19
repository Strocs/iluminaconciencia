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

export function GroupFigure({ group, expanded, selectedId, onSelect }: GroupFigureProps) {
  const scale = expanded ? 1 : group.members.length === 2 ? 0.75 : 0.6

  return (
    <div className="pointer-events-none relative h-28 w-32">
      {group.members.map((mark, index) => {
        const position = slot(index, group.members.length, expanded)
        return (
          <div
            key={mark.id}
            inert={!expanded}
            aria-hidden={!expanded}
            className={cn(
              'absolute top-1/2 left-1/2 flex size-8 -translate-1/2 items-center justify-center transition-transform duration-200 motion-reduce:transition-none',
              expanded && 'pointer-events-auto'
            )}
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
          'pointer-events-auto absolute top-1/2 left-1/2 h-16 w-18 -translate-1/2 cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground',
          expanded && 'pointer-events-none invisible'
        )}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(group, event.currentTarget)
        }}
      />
    </div>
  )
}
