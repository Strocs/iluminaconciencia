import { createStore } from 'zustand/vanilla'
import { bortleClasses } from '@/_shared/bortle/bortle-classes'
import { MapMark } from '../types'

const ALL_BORTLE_LEVELS = bortleClasses.map(({ level }) => level)

type FilterResult = {
  selectedInstrumentTypes: Set<string>
  selectedLevels: Set<number>
  filteredMarks: MapMark[]
}

export interface MapFilterState extends FilterResult {
  marks: MapMark[]
  instrumentTypes: string[]
  toggleInstrumentType: (instrumentType: string) => MapMark[]
  toggleLevel: (level: number) => MapMark[]
  selectAllInstrumentTypes: () => MapMark[]
  selectAllLevels: () => MapMark[]
  selectAll: () => MapMark[]
}

function filterMarks(marks: MapMark[], instrumentTypes: Set<string>, levels: Set<number>) {
  return marks.filter(
    ({ instrumentType, bortleLevel }) =>
      instrumentTypes.has(instrumentType) && bortleLevel !== null && levels.has(bortleLevel)
  )
}

export function createMapFilterStore(marks: MapMark[]) {
  const instrumentTypes = [...new Set(['SQC', ...marks.map(({ instrumentType }) => instrumentType)])].sort()
  const selectedInstrumentTypes = new Set(instrumentTypes)
  const selectedLevels = new Set(ALL_BORTLE_LEVELS)

  return createStore<MapFilterState>()((set, get) => {
    function updateFilters(nextInstrumentTypes: Set<string>, nextLevels: Set<number>) {
      const filteredMarks = filterMarks(marks, nextInstrumentTypes, nextLevels)
      set({ selectedInstrumentTypes: nextInstrumentTypes, selectedLevels: nextLevels, filteredMarks })
      return filteredMarks
    }

    return {
      marks,
      instrumentTypes,
      selectedInstrumentTypes,
      selectedLevels,
      filteredMarks: filterMarks(marks, selectedInstrumentTypes, selectedLevels),
      toggleInstrumentType: (instrumentType) => {
        const nextInstrumentTypes = new Set(get().selectedInstrumentTypes)
        if (nextInstrumentTypes.has(instrumentType)) nextInstrumentTypes.delete(instrumentType)
        else nextInstrumentTypes.add(instrumentType)
        return updateFilters(nextInstrumentTypes, get().selectedLevels)
      },
      toggleLevel: (level) => {
        const nextLevels = new Set(get().selectedLevels)
        if (nextLevels.has(level)) nextLevels.delete(level)
        else nextLevels.add(level)
        return updateFilters(get().selectedInstrumentTypes, nextLevels)
      },
      selectAllInstrumentTypes: () => updateFilters(new Set(instrumentTypes), get().selectedLevels),
      selectAllLevels: () => updateFilters(get().selectedInstrumentTypes, new Set(ALL_BORTLE_LEVELS)),
      selectAll: () => updateFilters(new Set(instrumentTypes), new Set(ALL_BORTLE_LEVELS))
    }
  })
}

export type MapFilterStore = ReturnType<typeof createMapFilterStore>
