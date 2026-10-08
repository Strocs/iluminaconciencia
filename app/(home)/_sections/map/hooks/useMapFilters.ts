'use client'

import { useContext } from 'react'
import { useStore } from 'zustand'
import { MapFilterStoreContext } from '../context/MapFilterContext'
import type { MapFilterState } from '../store/MapFilterStore'

export function useMapFilters<T>(selector: (state: MapFilterState) => T): T {
  const store = useContext(MapFilterStoreContext)
  if (!store) throw new Error('Map filters must be used inside MapFilterProvider')
  return useStore(store, selector)
}
