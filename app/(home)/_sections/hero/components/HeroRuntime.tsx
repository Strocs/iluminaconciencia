'use client'

import { useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { nightSkyConfig } from '../capabilities/night-sky/config'
import { createNightSkyCapability } from '../capabilities/night-sky/night-sky'
import { initializeHero } from '../runtime/initialize-hero'

gsap.registerPlugin(useGSAP)

export function HeroRuntime({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      const sky = createNightSkyCapability({ root, config: nightSkyConfig })
      try {
        const lifecycle = initializeHero(root, sky ?? undefined)
        return () => lifecycle.destroy()
      } catch (error) {
        sky?.destroy()
        throw error
      }
    },
    { scope: rootRef }
  )

  return (
    <section id="hero" ref={rootRef} className="group/hero relative min-h-[400dvh]" aria-labelledby="hero-title">
      <div className="h-dvh motion-safe:sticky motion-safe:top-0">{children}</div>
    </section>
  )
}
