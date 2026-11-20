import type { Map as MapLibreMap, PaddingOptions } from 'maplibre-gl'
import type { ChileRegion } from './chile-regions'

export function getRegionPadding(viewport: HTMLElement, floatingPanel: HTMLElement | null): PaddingOptions | null {
  const { left, width, height } = viewport.getBoundingClientRect()
  if (width === 0 || height === 0) return null

  const margin = Math.min(32, width / 8, height / 8)
  const occludedLeft = floatingPanel ? Math.max(0, floatingPanel.getBoundingClientRect().right - left) : 0
  return { top: margin, right: margin, bottom: margin, left: occludedLeft + margin }
}

export function frameMapRegion(map: MapLibreMap, region: ChileRegion, floatingPanel: HTMLElement | null) {
  const padding = getRegionPadding(map.getContainer(), floatingPanel)
  if (!padding) return

  map.fitBounds(region.bounds, {
    padding,
    linear: true,
    duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650
  })
}
