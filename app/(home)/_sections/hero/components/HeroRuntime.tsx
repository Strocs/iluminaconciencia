'use client'

import { useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { initializeHero } from '../runtime/initialize-hero'

gsap.registerPlugin(useGSAP)

export function HeroRuntime({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      const lifecycle = initializeHero(root)
      return () => lifecycle.destroy()
    },
    { scope: rootRef }
  )

  return (
    <section id="hero" ref={rootRef} className="relative min-h-[550dvh]" aria-labelledby="hero-title">
      <div data-hero-pin-layer className="h-dvh">
        {children}
      </div>
    </section>
  )
}
