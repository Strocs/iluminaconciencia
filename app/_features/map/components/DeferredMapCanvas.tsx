'use client'

import dynamic from 'next/dynamic'
import { useCallback, useState, type ComponentProps } from 'react'
import type { MapCanvas } from './MapCanvas'

function MapLoading() {
  return (
    <div className="flex size-full items-center justify-center">
      <div
        role="progressbar"
        aria-label="Cargando mapa"
        className="h-1 w-32 overflow-hidden rounded-full bg-primary/20"
      >
        <div className="h-full w-1/2 rounded-full bg-primary motion-safe:animate-map-loading motion-reduce:mx-auto" />
      </div>
    </div>
  )
}

const LazyMapCanvas = dynamic(() => import('./MapCanvas').then((module) => module.MapCanvas), {
  ssr: false,
  loading: MapLoading
})

export function DeferredMapCanvas({ eager = false, ...props }: ComponentProps<typeof MapCanvas> & { eager?: boolean }) {
  const [active, setActive] = useState(eager)
  const observe = useCallback(
    (element: HTMLDivElement | null) => {
      if (!element || active) return
      if (typeof IntersectionObserver === 'undefined') {
        setActive(true)
        return
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return
          observer.disconnect()
          setActive(true)
        },
        { rootMargin: `${window.innerHeight}px 0px` }
      )
      observer.observe(element)
      return () => observer.disconnect()
    },
    [active]
  )

  return (
    <div ref={observe} className="size-full">
      {active ? <LazyMapCanvas {...props} /> : <MapLoading />}
    </div>
  )
}
