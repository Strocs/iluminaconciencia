import { createStore } from 'zustand/vanilla'
import { bortleClasses } from '@/_shared/bortle/bortle-classes'
import type { MapInstrument } from '../data/types'

const ALL_BORTLE_LEVELS = bortleClasses.map(({ level }) => level)

type FilterResult = {
  selectedTypes: Set<string>
  selectedLevels: Set<number>
  filteredInstruments: MapInstrument[]
}

export interface MapFilterState extends FilterResult {
  instruments: MapInstrument[]
  types: string[]
  toggleType: (type: string) => MapInstrument[]
  toggleLevel: (level: number) => MapInstrument[]
  selectAllTypes: () => MapInstrument[]
  selectAllLevels: () => MapInstrument[]
  selectAll: () => MapInstrument[]
}

function filterInstruments(instruments: MapInstrument[], types: Set<string>, levels: Set<number>) {
  return instruments.filter(
    ({ type, bortleLevel }) => types.has(type) && bortleLevel !== null && levels.has(bortleLevel)
  )
}

export function createMapFilterStore(instruments: MapInstrument[]) {
  const types = [...new Set(['SQC', ...instruments.map(({ type }) => type)])].sort()
  const selectedTypes = new Set(types)
  const selectedLevels = new Set(ALL_BORTLE_LEVELS)

  return createStore<MapFilterState>()((set, get) => {
    function updateFilters(nextTypes: Set<string>, nextLevels: Set<number>) {
      const filteredInstruments = filterInstruments(instruments, nextTypes, nextLevels)
      set({ selectedTypes: nextTypes, selectedLevels: nextLevels, filteredInstruments })
      return filteredInstruments
    }

    return {
      instruments,
      types,
      selectedTypes,
      selectedLevels,
      filteredInstruments: filterInstruments(instruments, selectedTypes, selectedLevels),
      toggleType: (type) => {
        const nextTypes = new Set(get().selectedTypes)
        if (nextTypes.has(type)) nextTypes.delete(type)
        else nextTypes.add(type)
        return updateFilters(nextTypes, get().selectedLevels)
      },
      toggleLevel: (level) => {
        const nextLevels = new Set(get().selectedLevels)
        if (nextLevels.has(level)) nextLevels.delete(level)
        else nextLevels.add(level)
        return updateFilters(get().selectedTypes, nextLevels)
      },
      selectAllTypes: () => updateFilters(new Set(types), get().selectedLevels),
      selectAllLevels: () => updateFilters(get().selectedTypes, new Set(ALL_BORTLE_LEVELS)),
      selectAll: () => updateFilters(new Set(types), new Set(ALL_BORTLE_LEVELS))
    }
  })
}

export type MapFilterStore = ReturnType<typeof createMapFilterStore>
