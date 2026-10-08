'use client'

import { createContext, useState, type ReactNode } from 'react'
import type { MapFilterState, MapFilterStore } from '../store/MapFilterStore'
import { createMapFilterStore } from '../store/MapFilterStore'

export const MapFilterStoreContext = createContext<MapFilterStore | null>(null)

interface MapFilterProviderProps {
  instruments: MapFilterState['instruments']
  children: ReactNode
}

export function MapFilterProvider({ instruments, children }: MapFilterProviderProps) {
  const [store] = useState(() => createMapFilterStore(instruments))
  return <MapFilterStoreContext.Provider value={store}>{children}</MapFilterStoreContext.Provider>
}
