'use client'

import { createContext, useState, type ReactNode } from 'react'
import type { MapFilterState, MapFilterStore } from '../store/MapFilterStore'
import { createMapFilterStore } from '../store/MapFilterStore'

export const MapFilterStoreContext = createContext<MapFilterStore | null>(null)

interface MapFilterProviderProps {
  marks: MapFilterState['marks']
  children: ReactNode
}

export function MapFilterProvider({ marks, children }: MapFilterProviderProps) {
  const [store] = useState(() => createMapFilterStore(marks))
  return <MapFilterStoreContext.Provider value={store}>{children}</MapFilterStoreContext.Provider>
}
