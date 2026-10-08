'use client'

import { useMapOverlays } from '../hooks/useMapOverlays'
import { MapMarkDrawer } from './MarkDrawer'
import { FilterPanel } from './FilterPanel'

import { MapCanvas } from './MapCanvas'
import { LinkButton } from '@/_components/LinkButton'

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

      <div className="@container relative min-h-0 min-w-0 flex-1 self-stretch">
        <div
          className="relative size-full min-w-0 overflow-hidden rounded-xl border border-border bg-background transition-[width] duration-200 ease-in-out motion-reduce:transition-none motion-reduce:duration-0 md:group-data-drawer-open:w-[calc(100cqw-13.5rem)]"
          inert={mobileOverlayOpen}
          aria-hidden={mobileOverlayOpen}
        >
          <div className="absolute inset-y-0 left-0 w-full md:w-[100cqw]">
            <MapCanvas selectedId={selectedId} onSelect={openDrawer} panelOpen={mobileOverlayOpen} />
          </div>
          <LinkButton
            as="btn"
            ref={filterOpenRef}
            type="button"
            aria-expanded={filtersOpen}
            aria-controls={filterPanelId}
            className="absolute top-3 left-3 z-10 rounded-lg group-data-panel-open:hidden md:hidden"
            onClick={openFilters}
          >
            Filtros
          </LinkButton>
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
