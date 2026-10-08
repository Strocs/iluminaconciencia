'use client'

import { useMapFilters } from '../hooks/useMapFilters'

export function MapFilteredCount() {
  const count = useMapFilters((state) => state.filteredInstruments.length)
  const total = useMapFilters((state) => state.instruments.length)
  return (
    <span aria-live="polite">
      {count} de {total} {total === 1 ? 'punto visible' : 'puntos visibles'}
    </span>
  )
}
