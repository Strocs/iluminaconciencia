'use client'

import dynamic from 'next/dynamic'
import { useCallback, useState, type ComponentProps } from 'react'
import type { MapCanvas } from './MapCanvas'

function MapLoading() {
  return (
    <div role="status" className="flex size-full items-center justify-center text-sm text-text">
      Cargando mapa…
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
