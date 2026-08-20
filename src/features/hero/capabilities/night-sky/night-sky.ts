import { gsap } from 'gsap'
import { nightSkyConfig } from './config'
import type { HeroCapability } from '../../core/contracts'
import { mapStarCatalog } from './star-mapper'
import { starCatalog } from './star-catalog'
import { createWebglStarRenderer, type WebglStarRenderer } from './webgl-star-renderer'

type NightSkyConfig = typeof nightSkyConfig

interface NightSkyViewport {
  width: number
  height: number
  devicePixelRatio: number
}

type HeroSkyLifecycleState = 'initializing' | 'active' | 'fallback' | 'destroyed'

export interface NightSkyCapability extends HeroCapability {
  start(): void
  stop(): void
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

const isRootRelativeLocalUrl = (url: string): boolean =>
  url.startsWith('/') && !url.startsWith('//') && !url.includes('\\')

export function createNightSkyCapability({
  root,
  config
}: {
  root: HTMLElement
  config: NightSkyConfig
}): NightSkyCapability | null {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-hero-stars]')
  const fallbackImage = root.querySelector<HTMLImageElement>('[data-hero-sky-fallback]')
  if (!canvas) return null

  let lifecycleState: HeroSkyLifecycleState = 'initializing'
  let renderer: WebglStarRenderer | undefined
  let resizeGeneration = 0
  let destroyed = false
  let viewport: NightSkyViewport = { width: 1, height: 1, devicePixelRatio: 1 }
  let timeMs = 0
  let rafId = 0
  const fadeTimeline = gsap.timeline({ paused: true })
  fadeTimeline.fromTo(
    canvas,
    { opacity: config.starOpacity.initial },
    {
      opacity: config.starOpacity.full,
      duration: config.starOpacity.fullProgress,
      ease: 'none'
    },
    0
  )
  fadeTimeline.to(
    canvas,
    {
      opacity: config.starOpacity.final,
      duration: config.starOpacity.finalProgress - config.starOpacity.fadeOutStartProgress,
      ease: 'none'
    },
    config.starOpacity.fadeOutStartProgress
  )
  fadeTimeline.add(() => undefined, 1)

  const isReducedMotion = (): boolean => window.matchMedia(reducedMotionQuery).matches
  const getViewport = (): NightSkyViewport => {
    const { width, height } = canvas.getBoundingClientRect()
    return {
      width: Math.max(1, width),
      height: Math.max(1, height),
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, config.maximumDevicePixelRatio)
    }
  }
  const fallbackSource = fallbackImage?.dataset.fallbackSrc
  const showFallback = (): void => {
    if (!fallbackImage || !fallbackSource || !isRootRelativeLocalUrl(fallbackSource)) return
    fallbackImage.hidden = false
    fallbackImage.src = fallbackSource
  }
  const hideFallback = (): void => {
    if (!fallbackImage) return
    // Drop src so the browser stops requesting it and no stale error re-fires.
    fallbackImage.hidden = true
    fallbackImage.removeAttribute('src')
  }
  const setLifecycleState = (next: HeroSkyLifecycleState): void => {
    lifecycleState = next
    canvas.dataset.heroSkyState = next
    if (next === 'active') hideFallback()
    else if (next === 'fallback') showFallback()
  }
  const renderFrame = (): void => {
    if (lifecycleState === 'active') renderer?.draw(timeMs)
  }
  const loop = (nowMs: number): void => {
    timeMs = nowMs
    renderFrame()
    rafId = requestAnimationFrame(loop)
  }
  const startLoop = (): void => {
    if (rafId !== 0) return
    rafId = requestAnimationFrame(loop)
  }
  const stopLoop = (): void => {
    if (rafId === 0) return
    cancelAnimationFrame(rafId)
    rafId = 0
  }
  const applyViewport = (): void => {
    if (destroyed) return
    viewport = getViewport()
    if (lifecycleState !== 'active') return
    renderer?.resize(viewport)
    renderFrame()
  }
  const enterFallback = (): void => {
    if (destroyed) return
    stopLoop()
    renderer?.destroy()
    renderer = undefined
    setLifecycleState('fallback')
  }
  const onContextLost = (event: Event): void => {
    event.preventDefault()
    if (destroyed || lifecycleState !== 'active') return
    enterFallback()
  }
  const onResize = (): void => {
    const currentResize = ++resizeGeneration
    queueMicrotask(() => {
      if (destroyed || currentResize !== resizeGeneration) return
      applyViewport()
    })
  }
  const observer = new ResizeObserver(onResize)
  const reducedMotionMedia = window.matchMedia(reducedMotionQuery)
  const onReducedMotionChange = (event: MediaQueryListEvent): void => {
    // Preference switched to reduced while the sky is live: freeze it into the static image.
    if (event.matches && lifecycleState !== 'fallback' && lifecycleState !== 'destroyed') {
      enterFallback()
    }
  }

  canvas.addEventListener('webglcontextlost', onContextLost)
  fallbackImage?.addEventListener('error', hideFallback)
  reducedMotionMedia.addEventListener('change', onReducedMotionChange)
  observer.observe(canvas)
  applyViewport()

  if (isReducedMotion() || !document.createElement('canvas').getContext('webgl2')) {
    // Reduced motion (or WebGL2 unavailable): render the static sky image instead.
    enterFallback()
  } else {
    try {
      renderer = createWebglStarRenderer(canvas, mapStarCatalog(starCatalog))
      renderer.resize(viewport)
      setLifecycleState('active')
      renderFrame()
    } catch {
      enterFallback()
    }
  }

  return {
    onProgress: (progress) => fadeTimeline.progress(progress),
    start: () => {
      if (destroyed) return
      startLoop()
    },
    stop: () => {
      if (rafId === 0) return
      stopLoop()
      // Deterministic freeze: draw one final frame with time 0.
      renderer?.draw(0)
    },
    destroy: () => {
      if (destroyed) return
      destroyed = true
      stopLoop()
      fadeTimeline.kill()
      observer.disconnect()
      canvas.removeEventListener('webglcontextlost', onContextLost)
      fallbackImage?.removeEventListener('error', hideFallback)
      reducedMotionMedia.removeEventListener('change', onReducedMotionChange)
      renderer?.destroy()
      renderer = undefined
      setLifecycleState('destroyed')
    }
  }
}
