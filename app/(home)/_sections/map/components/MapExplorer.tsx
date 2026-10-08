'use client'

import { useMapFilters } from '../hooks/useMapFilters'
import { useMapOverlays } from '../hooks/useMapOverlays'
import { MapInstrumentDrawer } from './InstrumentDrawer'
import { FilterPanel } from './FilterPanel'

import { MapCanvas } from './MapCanvas'

const MAP_STYLE_URL = '/maps/openfreemap-dark.json'
const DEFAULT_CENTER = { latitude: -30.02, longitude: -71.27 }
const DEFAULT_ZOOM = 9

export function MapExplorer() {
  const {
    selectedId,
    filtersOpen,
    mobile,
    panelRef,
    drawerCloseRef,
    filterOpenRef,
    filterTitleId,
    filterPanelId,
    onFiltersChanged,
    openDrawer,
    openFilters,
    closeDrawer,
    closeFilters,
    handleFilterKeyDown,
    handleDrawerKeyDown
  } = useMapOverlays()

  const selectedInstrument = useMapFilters(
    (state) => state.filteredInstruments.find(({ id }) => id === selectedId) ?? null
  )

  const drawerOpen = selectedInstrument !== null
  const mobileOverlayOpen = mobile && (filtersOpen || drawerOpen)

  return (
    <div
      className="group relative mx-auto flex min-h-0 w-full max-w-360 flex-1 gap-4 lg:max-h-160"
      data-panel-open={filtersOpen || drawerOpen ? '' : undefined}
    >
      <FilterPanel
        panelRef={panelRef}
        titleId={filterTitleId}
        panelId={filterPanelId}
        mobile={mobile}
        filtersOpen={filtersOpen}
        onKeyDown={handleFilterKeyDown}
        onClose={() => closeFilters()}
        onFiltersChanged={onFiltersChanged}
      />

      <div
        className="relative min-h-0 min-w-0 flex-1 self-stretch overflow-hidden rounded-xl border border-border bg-background"
        inert={mobileOverlayOpen}
        aria-hidden={mobileOverlayOpen}
      >
        <MapCanvas
          selectedId={selectedId}
          mapStyle={MAP_STYLE_URL}
          initialViewState={{ ...DEFAULT_CENTER, zoom: DEFAULT_ZOOM }}
          onSelect={openDrawer}
          panelOpen={mobileOverlayOpen}
        />
        <button
          ref={filterOpenRef}
          type="button"
          aria-expanded={filtersOpen}
          aria-controls={filterPanelId}
          className="absolute top-3 left-3 z-10 rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background shadow-lg group-data-panel-open:hidden md:hidden"
          onClick={openFilters}
        >
          Filtros
        </button>
      </div>

      <MapInstrumentDrawer
        instrument={selectedInstrument}
        mobile={mobile}
        inert={filtersOpen || !drawerOpen}
        closeButtonRef={drawerCloseRef}
        onClose={() => closeDrawer()}
        onKeyDown={handleDrawerKeyDown}
      />
    </div>
  )
}
