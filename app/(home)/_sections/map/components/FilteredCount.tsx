'use client'

import { useMapFilters } from '../hooks/useMapFilters'

export function MapFilteredCount() {
  const count = useMapFilters((state) => state.filteredMarks.length)
  const total = useMapFilters((state) => state.marks.length)
  return (
    <span aria-live="polite">
      {count} de {total} {total === 1 ? 'punto visible' : 'puntos visibles'}
    </span>
  )
}
