'use client'

import { ViewTransition } from 'react'
import { cn } from '@/_utils/cn'
import { useMapOverlays } from '../hooks/useMapOverlays'
import { MapMarkDrawer } from './MarkDrawer'
import { FilterPanel } from './FilterPanel'

import { DeferredMapCanvas } from './DeferredMapCanvas'
import { Button } from '@/_components/Button'

export function MapExplorer({ fullscreen = false }: { fullscreen?: boolean }) {
  const {
    selectedId,
    selectedGroupId,
    drawerGroup,
    explorerRef,
    onKeyDown,
    drawerOpen,
    filtersOpen,
    mobile,
    panelRef,
    drawerCloseRef,
    drawerListRef,
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
      ref={explorerRef}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      aria-label="Explorador de instrumentos"
      className={cn(
        'group relative mx-auto flex size-full min-h-0 max-w-360 flex-1 gap-4 overflow-x-clip',
        fullscreen &&
          'max-w-none gap-0 overflow-hidden md:overflow-clip md:[--map-attribution-left:--spacing(70)] md:data-drawer-open:[--map-controls-right:21.5rem]'
      )}
      data-panel-open={filtersOpen || drawerOpen ? '' : undefined}
      data-drawer-open={drawerOpen ? '' : undefined}
    >
      <FilterPanel
        floating={fullscreen}
        panelRef={panelRef}
        titleId={filterTitleId}
        panelId={filterPanelId}
        mobile={mobile}
        filtersOpen={filtersOpen}
        onClose={() => closeFilters()}
        onFiltersChanged={onFiltersChanged}
      />

      <div
        className={cn(
          '@container relative flex min-h-0 min-w-0 flex-1 self-stretch [--drawer-gap:1rem] [--drawer-width:13.5rem]',
          fullscreen && '[--drawer-width:20rem]'
        )}
      >
        <ViewTransition name="instrument-map" share="map-expand" default="none">
          <div
            className={cn(
              'relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-background',
              fullscreen && 'rounded-none border-0 md:overflow-clip'
            )}
            inert={mobileOverlayOpen}
            aria-hidden={mobileOverlayOpen}
          >
            <div className="absolute inset-y-0 left-0 w-full md:w-[100cqw]">
              <DeferredMapCanvas
                eager={fullscreen}
                fullscreen={fullscreen}
                cooperativeGestures={!fullscreen}
                selectedId={selectedId}
                selectedGroupId={selectedGroupId}
                onSelect={openDrawer}
                onClose={() => {
                  if (drawerOpen) closeDrawer()
                }}
                panelOpen={mobileOverlayOpen}
              />
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
        </ViewTransition>
        <MapMarkDrawer
          floating={fullscreen}
          marks={drawerGroup?.members ?? []}
          selectedId={selectedId}
          open={drawerOpen}
          mobile={mobile}
          inert={filtersOpen || !drawerOpen}
          closeButtonRef={drawerCloseRef}
          listRef={drawerListRef}
          onClose={() => closeDrawer()}
        />
      </div>
    </div>
  )
}
