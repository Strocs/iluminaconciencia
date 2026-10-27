import type { HeroCapability } from '../../core/contracts'
import { frontalSilhouetteGeometry } from '../../landscape'
import { lightPollutionConfig } from './config'
import { createAtmosphereRenderer, type AtmosphereRenderer } from './atmosphere-renderer'

/** CSS/SVG keep their own opacity timelines; visibility switches only after a successful GPU draw. */
export function createAtmosphereCapability(root: HTMLElement): HeroCapability | null {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-hero-atmosphere]')
  const terrain = root.querySelector<HTMLElement>('[data-hero-terrain-plane]')
  if (!canvas || !terrain || typeof ResizeObserver === 'undefined') return null

  const layers = Array.from(
    root.querySelectorAll<HTMLElement>('[data-hero-light-pollution-horizon], [data-hero-light-pollution-backlight]')
  )
  const visibility = layers.map((layer) => layer.style.visibility)
  const originalCanvasVisibility = canvas.style.visibility
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let renderer: AtmosphereRenderer | undefined
  let destroyed = false
  let failed = motion.matches
  let scheduled = 0
  let progress = 0
  const restoreFallback = () => {
    canvas.style.visibility = 'hidden'
    layers.forEach((layer, index) => {
      layer.style.visibility = visibility[index]
    })
    delete root.dataset.heroAtmosphereReady
  }
  const cancelFrame = () => {
    if (scheduled) cancelAnimationFrame(scheduled)
    scheduled = 0
  }
  const enterFallback = () => {
    failed = true
    cancelFrame()
    restoreFallback()
    renderer?.destroy()
    renderer = undefined
  }
  const draw = () => {
    if (destroyed || failed) return
    try {
      const bounds = canvas.getBoundingClientRect()
      const plane = terrain.getBoundingClientRect()
      // A zero-sized initial mount may become measurable later; it is not a context retry.
      if (!(bounds.width > 0) || !(bounds.height > 0) || !(plane.width > 0) || !(plane.height > 0)) return
      renderer ??= createAtmosphereRenderer(canvas)
      renderer.resize(
        {
          width: bounds.width,
          height: bounds.height,
          devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2)
        },
        {
          left: plane.left - bounds.left,
          top: plane.top - bounds.top,
          scaleX: plane.width / frontalSilhouetteGeometry.viewBoxWidth,
          scaleY: plane.height / frontalSilhouetteGeometry.viewBoxHeight
        }
      )
      const { startProgress, endProgress } = lightPollutionConfig.horizon
      const intensity = Math.max(0, Math.min(1, 1 - (progress - startProgress) / (endProgress - startProgress)))
      if (!renderer.draw(intensity)) {
        enterFallback()
        return
      }
      layers.forEach((layer) => {
        layer.style.visibility = 'hidden'
      })
      canvas.style.visibility = 'visible'
      root.dataset.heroAtmosphereReady = 'true'
    } catch {
      enterFallback()
    }
  }
  const schedule = () => {
    if (destroyed || failed || scheduled) return
    scheduled = requestAnimationFrame(() => {
      scheduled = 0
      draw()
    })
  }
  const onContextLost = (event: Event) => {
    event.preventDefault()
    if (!destroyed) enterFallback()
  }
  const onMotionChange = (event: MediaQueryListEvent) => {
    if (!destroyed && event.matches) enterFallback()
  }
  const observer = new ResizeObserver(schedule)
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })
  canvas.addEventListener('webglcontextlost', onContextLost)
  motion.addEventListener('change', onMotionChange)
  observer.observe(canvas)
  observer.observe(terrain)
  draw()

  return {
    onProgress: (value) => {
      if (destroyed) return
      progress = value
      // Run after all shared progress handlers have updated fixed framing and DOM placement.
      schedule()
    },
    destroy: () => {
      if (destroyed) return
      destroyed = true
      cancelFrame()
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      motion.removeEventListener('change', onMotionChange)
      renderer?.destroy()
      renderer = undefined
      restoreFallback()
      canvas.style.visibility = originalCanvasVisibility
    }
  }
}
