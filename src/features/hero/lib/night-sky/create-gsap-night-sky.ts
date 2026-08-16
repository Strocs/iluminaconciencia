import { skyRendering } from '../../config/sky-rendering'
import type {
  HeroSkyController,
  HeroSkyLifecycleState,
  HeroSkyRenderer,
  NightSkyFrame,
  NightSkyScene,
  NightSkyViewport
} from '../contracts/hero-runtime'
import type { StarInstanceLevel } from './packed-star-data'
import type { HeroSkyDiagnosticsRecorder } from './hero-sky-diagnostics'
import { loadHeroSkyAssets } from './load-hero-sky-assets'
import { createWebglStarRenderer } from './webgl-star-renderer'

interface CreateGsapNightSkyOptions {
  canvas: HTMLCanvasElement
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

const selectInstanceCount = ({ width, height }: NightSkyViewport): StarInstanceLevel => {
  const requested = Math.max(1, Math.ceil((width * height) / skyRendering.starDensityDivisor))
  return (
    skyRendering.instanceCounts.find((count) => count >= requested) ??
    skyRendering.instanceCounts[skyRendering.instanceCounts.length - 1]
  )
}

export function createGsapNightSky({ canvas }: CreateGsapNightSkyOptions): HeroSkyController {
  let lifecycleState: HeroSkyLifecycleState = 'initializing'
  let renderer: HeroSkyRenderer | undefined
  let generation = 0
  let resizeGeneration = 0
  const abortController = new AbortController()
  let destroyed = false
  let viewport: NightSkyViewport = { width: 1, height: 1, devicePixelRatio: 1 }
  let latestFrame: NightSkyFrame = Object.freeze({ progress: 0, animationTimeMs: 0 })
  let fixedInstanceCount: StarInstanceLevel | undefined
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
  const setLifecycleState = (next: HeroSkyLifecycleState): void => {
    lifecycleState = next
    canvas.dataset.heroSkyState = next
    if (next === 'fallback') canvas.dataset.heroSkyFallback = 'visible'
    else delete canvas.dataset.heroSkyFallback
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
    renderer?.setInstanceCount(fixedInstanceCount ?? selectInstanceCount(viewport))
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

  canvas.addEventListener('webglcontextlost', onContextLost)
  observer.observe(canvas)
  applyViewport()

  if (import.meta.env.DEV) {
    void import('./hero-sky-diagnostics').then(({ createHeroSkyDiagnostics }) => {
      if (destroyed) return
      diagnostics = createHeroSkyDiagnostics({
        canvas,
        getLifecycleState: () => lifecycleState,
        setFixedInstanceCount: (count) => {
          fixedInstanceCount = count
          applyViewport()
        },
        setFixedFrame: (frame) => {
          fixedFrame = frame
          renderLatestFrame()
        },
        forceInitializationFailure: enterFallback,
        forceContextLoss: () => onContextLost(new Event('webglcontextlost'))
      })
    })
  }

  const currentGeneration = ++generation
  void loadHeroSkyAssets({
    packedDataUrl: skyRendering.packedDataUrl,
    generation: currentGeneration,
    signal: abortController.signal,
    isCurrentGeneration: (candidate) => !destroyed && candidate === generation
  }).then((result) => {
    if (destroyed || result.generation !== generation || !result.ok) {
      if (!destroyed && result.generation === generation && !result.ok && result.error.code !== 'aborted')
        enterFallback()
      return
    }
    try {
      renderer = createWebglStarRenderer(canvas, result.assets.packedStarData, 2_000, {
        onDraw: (durationMs) => diagnostics?.recordDraw(durationMs)
      })
      renderer.resize(viewport)
      renderer.setInstanceCount(fixedInstanceCount ?? selectInstanceCount(viewport))
      setLifecycleState('active')
      renderLatestFrame()
    } catch {
      enterFallback()
    }
  })

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
      generation += 1
      abortController.abort()
      observer.disconnect()
      canvas.removeEventListener('webglcontextlost', onContextLost)
      renderer?.destroy()
      renderer = undefined
      diagnostics?.destroy()
      diagnostics = undefined
      setLifecycleState('destroyed')
    }
  }
}
