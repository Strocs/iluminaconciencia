'use client'

import { useMapOverlays } from '../hooks/useMapOverlays'
import { MapMarkDrawer } from './MarkDrawer'
import { FilterPanel } from './FilterPanel'

import { DeferredMapCanvas } from './DeferredMapCanvas'
import { Button } from '@/_components/Button'

export function MapExplorer() {
  const {
    selectedId,
    drawerMark,
    drawerOpen,
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
    closeFilters
  } = useMapOverlays()

  const mobileOverlayOpen = mobile && (filtersOpen || drawerOpen)

  return (
    <div
      className="group relative mx-auto flex size-full min-h-0 max-w-360 flex-1 gap-4 overflow-x-clip"
      data-panel-open={filtersOpen || drawerOpen ? '' : undefined}
      data-drawer-open={drawerOpen ? '' : undefined}
    >
      <FilterPanel
        panelRef={panelRef}
        titleId={filterTitleId}
        panelId={filterPanelId}
        mobile={mobile}
        filtersOpen={filtersOpen}
        onClose={() => closeFilters()}
        onFiltersChanged={onFiltersChanged}
      />

      <div className="@container relative flex min-h-0 min-w-0 flex-1 self-stretch [--drawer-gap:1rem] [--drawer-width:13.5rem]">
        <div
          className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-background"
          inert={mobileOverlayOpen}
          aria-hidden={mobileOverlayOpen}
        >
          <div className="absolute inset-y-0 left-0 w-full md:w-[100cqw]">
            <DeferredMapCanvas selectedId={selectedId} onSelect={openDrawer} panelOpen={mobileOverlayOpen} />
          </div>
          <Button
            as="btn"
            ref={filterOpenRef}
            type="button"
            aria-expanded={filtersOpen}
            aria-controls={filterPanelId}
            className="absolute top-3 left-3 z-10 rounded-lg group-data-panel-open:hidden md:hidden"
            onClick={openFilters}
          >
            Filtros
          </Button>
        </div>
        <MapMarkDrawer
          mark={drawerMark}
          open={drawerOpen}
          mobile={mobile}
          inert={filtersOpen || !drawerOpen}
          closeButtonRef={drawerCloseRef}
          onClose={() => closeDrawer()}
        />
      </div>
    </div>
  )
}
