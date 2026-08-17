import { skyRendering } from '../../config/sky-rendering'
import type {
  HeroSkyController,
  HeroSkyLifecycleState,
  HeroSkyRenderer,
  NightSkyFrame,
  NightSkyScene,
  NightSkyViewport
} from '../contracts/hero-runtime'
import type { HeroSkyDiagnosticsRecorder } from './hero-sky-diagnostics'
import { mapStarCatalog } from './map-star-catalog'
import { starCatalog } from './sky-catalog'
import { createWebglStarRenderer } from './webgl-star-renderer'

interface CreateGsapNightSkyOptions {
  canvas: HTMLCanvasElement
  fallbackImage?: HTMLImageElement | null
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

const isRootRelativeLocalUrl = (url: string): boolean =>
  url.startsWith('/') && !url.startsWith('//') && !url.includes('\\')

export function createGsapNightSky({ canvas, fallbackImage }: CreateGsapNightSkyOptions): HeroSkyController {
  let lifecycleState: HeroSkyLifecycleState = 'initializing'
  let renderer: HeroSkyRenderer | undefined
  let resizeGeneration = 0
  let destroyed = false
  let viewport: NightSkyViewport = { width: 1, height: 1, devicePixelRatio: 1 }
  let latestFrame: NightSkyFrame = Object.freeze({ progress: 0, animationTimeMs: 0 })
  let fixedFrame: NightSkyFrame | undefined
  let diagnostics: HeroSkyDiagnosticsRecorder | undefined

  const isReducedMotion = (): boolean => window.matchMedia(reducedMotionQuery).matches
  const getViewport = (): NightSkyViewport => {
    const { width, height } = canvas.getBoundingClientRect()
    return {
      width: Math.max(1, width),
      height: Math.max(1, height),
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, skyRendering.maximumDevicePixelRatio)
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
  const getScene = (): NightSkyScene => ({
    progress: fixedFrame?.progress ?? latestFrame.progress,
    animationTime: isReducedMotion() ? 0 : (fixedFrame?.animationTimeMs ?? latestFrame.animationTimeMs)
  })
  const renderLatestFrame = (): void => {
    if (lifecycleState === 'active') renderer?.draw(getScene())
  }
  const applyViewport = (): void => {
    if (destroyed) return
    viewport = getViewport()
    if (lifecycleState !== 'active') return
    renderer?.resize(viewport)
    renderLatestFrame()
  }
  const enterFallback = (): void => {
    if (destroyed) return
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

  if (import.meta.env.DEV) {
    void import('./hero-sky-diagnostics').then(({ createHeroSkyDiagnostics }) => {
      if (destroyed) return
      diagnostics = createHeroSkyDiagnostics({
        canvas,
        getLifecycleState: () => lifecycleState,
        setFixedFrame: (frame) => {
          fixedFrame = frame
          renderLatestFrame()
        },
        forceInitializationFailure: enterFallback,
        forceContextLoss: () => onContextLost(new Event('webglcontextlost'))
      })
    })
  }

  if (isReducedMotion() || !document.createElement('canvas').getContext('webgl2')) {
    // Reduced motion (or WebGL2 unavailable): render the static sky image instead.
    enterFallback()
  } else {
    try {
      renderer = createWebglStarRenderer(canvas, mapStarCatalog(starCatalog), {
        onDraw: (durationMs) => diagnostics?.recordDraw(durationMs)
      })
      renderer.resize(viewport)
      setLifecycleState('active')
      renderLatestFrame()
    } catch {
      enterFallback()
    }
  }

  return {
    get lifecycleState(): HeroSkyLifecycleState {
      return lifecycleState
    },
    draw: (frame) => {
      if (destroyed) return
      latestFrame = frame
      renderLatestFrame()
    },
    resize: onResize,
    destroy: () => {
      if (destroyed) return
      destroyed = true
      observer.disconnect()
      canvas.removeEventListener('webglcontextlost', onContextLost)
      fallbackImage?.removeEventListener('error', hideFallback)
      reducedMotionMedia.removeEventListener('change', onReducedMotionChange)
      renderer?.destroy()
      renderer = undefined
      diagnostics?.destroy()
      diagnostics = undefined
      setLifecycleState('destroyed')
    }
  }
}
