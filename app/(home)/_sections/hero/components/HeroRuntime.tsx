'use client'

import { useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { nightSkyConfig } from '../capabilities/night-sky/config'
import { createNightSkyCapability } from '../capabilities/night-sky/night-sky'
import { initializeHero } from '../runtime/initialize-hero'
import { HeroFpsMonitor } from './HeroFpsMonitor'

gsap.registerPlugin(useGSAP)

export function HeroRuntime({ children, overlay }: { children: ReactNode; overlay?: ReactNode }) {
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
    <section
      id="hero"
      ref={rootRef}
      className="group/hero relative min-h-[400lvh] portrait:min-h-[300lvh] [&[data-debug-backlight-disabled]_[data-hero-light-pollution-backlight]]:hidden [&[data-debug-bortle-disabled]_[data-hero-bortle-scale]]:invisible [&[data-debug-night-sky-disabled]_[data-hero-sky-host]]:hidden [&[data-debug-night-sky-disabled]_[data-hero-star-badges]]:hidden [&[data-debug-pollution-disabled]_[data-hero-light-pollution-horizon]]:hidden"
      aria-labelledby="hero-title"
    >
      <div
        role="group"
        aria-label="Hero debug"
        className="fixed inset-x-0 top-0 z-200 flex flex-wrap items-center justify-center gap-x-4 bg-background px-2 font-body text-xs text-foreground shadow"
      >
        {[
          { feature: 'night-sky', label: 'Night sky' },
          { feature: 'pollution', label: 'Pollution' },
          { feature: 'backlight', label: 'Backlight' },
          { feature: 'bortle', label: 'Bortle' },
          { feature: 'twinkle', label: 'Twinkle' }
        ].map(({ feature, label }) => (
          <label key={feature} className="inline-flex min-h-11 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              role="switch"
              defaultChecked
              data-hero-debug={feature}
              className="relative h-6 w-10 shrink-0 appearance-none rounded-full border border-foreground/40 bg-foreground/20 after:absolute after:top-0.5 after:left-0.5 after:size-4.5 after:rounded-full after:bg-foreground checked:bg-primary checked:after:translate-x-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
            {label}
          </label>
        ))}
        <HeroFpsMonitor />
      </div>
      <div className="h-lvh motion-safe:sticky motion-safe:top-0">{children}</div>
      {overlay}
    </section>
  )
}
