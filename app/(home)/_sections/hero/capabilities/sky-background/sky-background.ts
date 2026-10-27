import { gsap } from 'gsap'
import type { HeroCapability } from '../../core/contracts'

export function createSkyBackgroundCapability(root: HTMLElement): HeroCapability | null {
  const artwork = root.querySelector<HTMLElement>('[data-hero-sky-background]')
  if (!artwork) return null

  const fadeTimeline = gsap.timeline({ paused: true })
  fadeTimeline.fromTo(artwork, { opacity: 0.05 }, { opacity: 1, duration: 0.8, ease: 'power2.in' }, 0)
  fadeTimeline.add(() => undefined, 1)

  let destroyed = false
  return {
    onProgress: (progress) => fadeTimeline.progress(progress),
    destroy: () => {
      if (destroyed) return
      destroyed = true
      fadeTimeline.kill()
    }
  }
}
