'use client'

import { createContext, useState, type ReactNode } from 'react'
import type { MapFilterState, MapFilterStore } from '../store/MapFilterStore'
import { createMapFilterStore } from '../store/MapFilterStore'
import type { MapGroup } from '../types'

export const MapFilterStoreContext = createContext<MapFilterStore | null>(null)

interface MapFilterProviderProps {
  marks: MapFilterState['marks']
  groups: MapGroup[]
  children: ReactNode
}

export function MapFilterProvider({ marks, groups, children }: MapFilterProviderProps) {
  const [store] = useState(() => createMapFilterStore(marks, groups))
  return <MapFilterStoreContext.Provider value={store}>{children}</MapFilterStoreContext.Provider>
}
