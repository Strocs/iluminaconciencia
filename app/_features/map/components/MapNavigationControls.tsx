'use client'

import { createPortal } from 'react-dom'
import { useControl } from 'react-map-gl/maplibre'
import { NavigationControl, type Map as MapLibreMap } from 'maplibre-gl'
import { MapViewportLink } from './MapViewportLink'

class ViewportNavigationControl extends NavigationControl {
  readonly linkHost = document.createElement('div')

  constructor() {
    super({ showCompass: false })
  }

  override onAdd(map: MapLibreMap) {
    const container = super.onAdd(map)
    container.prepend(this.linkHost)
    return container
  }
}

export function MapNavigationControls({ fullscreen }: { fullscreen: boolean }) {
  const control = useControl(() => new ViewportNavigationControl(), { position: 'bottom-right' })

  return createPortal(<MapViewportLink fullscreen={fullscreen} />, control.linkHost)
}
