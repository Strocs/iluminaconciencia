import { gsap } from 'gsap'
import { nightSkyConfig } from './config'
import { computeSkyArtworkPlacement } from './sky-crop'
import { nightSkyAssets } from './sky-assets'
import type { HeroSkyCapability } from './contracts'
import { mapStarCatalog } from './star-mapper'
import { starCatalog, starCatalogOriginalIndices } from './star-catalog'
import { createWebglStarRenderer, type WebglStarRenderer } from './webgl-star-renderer'

type NightSkyConfig = typeof nightSkyConfig

interface NightSkyViewport {
  width: number
  height: number
  devicePixelRatio: number
}

type HeroSkyLifecycleState = 'initializing' | 'active' | 'fallback' | 'destroyed'

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

export function createNightSkyCapability({
  root,
  config
}: {
  root: HTMLElement
  config: NightSkyConfig
}): HeroSkyCapability | null {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-hero-stars]')
  const photo = root.querySelector<HTMLImageElement>('[data-hero-sky-photo]')
  const photoPlane = root.querySelector<HTMLElement>('[data-hero-sky-photo-plane]')
  const fallbackImage = root.querySelector<HTMLImageElement>('[data-hero-sky-fallback]')
  const artwork = root.querySelector<HTMLElement>('[data-hero-sky-artwork]')
  if (!canvas || !photo || !photoPlane || !fallbackImage || !artwork) return null

  let lifecycleState: HeroSkyLifecycleState = 'initializing'
  let renderer: WebglStarRenderer | undefined
  let resizeGeneration = 0
  let destroyed = false
  let attemptedInitialization = false
  let requestedRunning = false
  let viewport: NightSkyViewport = { width: 0, height: 0, devicePixelRatio: 1 }
  let timeMs = 0
  let rafId = 0
  const fadeTimeline = gsap.timeline({ paused: true })
  fadeTimeline.fromTo(artwork, { opacity: config.starOpacity.initial }, {
    opacity: config.starOpacity.full,
    duration: config.starOpacity.fullProgress,
    ease: 'none'
  }, 0)
  fadeTimeline.add(() => undefined, 1)

  const getViewport = (): NightSkyViewport => {
    const { width, height } = canvas.getBoundingClientRect()
    return {
      width,
      height,
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, config.maximumDevicePixelRatio)
    }
  }
  const setArtworkPlacement = (size: NightSkyViewport): ReturnType<typeof computeSkyArtworkPlacement> | null => {
    if (!(size.width > 0) || !(size.height > 0)) return null
    const placement = computeSkyArtworkPlacement(size.width, size.height, nightSkyAssets.bounds)
    for (const layer of [photoPlane, fallbackImage]) {
      layer.style.width = `${placement.width}px`
      layer.style.height = `${placement.height}px`
      layer.style.left = `${placement.left}px`
      layer.style.top = `${placement.top}px`
      layer.style.transform = 'none'
    }
    return placement
  }
  const showFallback = (): void => {
    photoPlane.style.visibility = 'hidden'
    fallbackImage.dataset.heroSkyFallbackVisible = 'true'
  }
  const setLifecycleState = (next: HeroSkyLifecycleState): void => {
    lifecycleState = next
    canvas.dataset.heroSkyState = next
    if (next === 'active') return
    requestedRunning = false
    delete canvas.dataset.heroSkyReady
    showFallback()
  }
  const stopLoop = (): void => {
    if (rafId === 0) return
    cancelAnimationFrame(rafId)
    rafId = 0
  }
  const enterFallback = (): void => {
    if (destroyed) return
    stopLoop()
    renderer?.destroy()
    renderer = undefined
    setLifecycleState('fallback')
  }
  const drawAndActivate = (frameTimeMs: number): boolean => {
    if (!renderer || !renderer.draw(frameTimeMs)) return false
    setLifecycleState('active')
    canvas.dataset.heroSkyReady = 'true'
    photoPlane.style.visibility = 'visible'
    fallbackImage.dataset.heroSkyFallbackVisible = 'false'
    return true
  }
  const renderFrame = (frameTimeMs: number): boolean => {
    if (lifecycleState !== 'active' || !renderer) return false
    try {
      if (renderer.draw(frameTimeMs)) return true
    } catch {
      enterFallback()
      return false
    }
    enterFallback()
    return false
  }
  const loop = (nowMs: number): void => {
    rafId = 0
    timeMs = nowMs
    if (!renderFrame(timeMs) || destroyed || !requestedRunning) return
    rafId = requestAnimationFrame(loop)
  }
  const startLoop = (): void => {
    if (!requestedRunning || rafId !== 0 || lifecycleState !== 'active') return
    rafId = requestAnimationFrame(loop)
  }
  const initializeWhenSized = (size: NightSkyViewport, placement: ReturnType<typeof computeSkyArtworkPlacement>): void => {
    if (attemptedInitialization || lifecycleState !== 'initializing' || destroyed || !(size.width > 0) || !(size.height > 0)) return
    attemptedInitialization = true
    if (reducedMotionMedia.matches) {
      setLifecycleState('fallback')
      return
    }
    try {
      renderer = createWebglStarRenderer(canvas, mapStarCatalog(starCatalog, starCatalogOriginalIndices))
      renderer.resize(size, placement.crop)
      if (!drawAndActivate(timeMs)) enterFallback()
      else if (requestedRunning) startLoop()
    } catch {
      enterFallback()
    }
  }
  const applyViewport = (): void => {
    if (destroyed) return
    viewport = getViewport()
    const placement = setArtworkPlacement(viewport)
    if (!placement) return
    if (lifecycleState === 'initializing') {
      initializeWhenSized(viewport, placement)
      return
    }
    if (lifecycleState !== 'active') return
    try {
      renderer?.resize(viewport, placement.crop)
      renderFrame(timeMs)
    } catch {
      enterFallback()
    }
  }
  const onContextLost = (event: Event): void => {
    event.preventDefault()
    if (destroyed || lifecycleState !== 'active') return
    enterFallback()
  }
  const onPhotoError = (): void => {
    artwork.dataset.heroSkyPhotoError = 'true'
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
    if (event.matches && lifecycleState !== 'fallback' && lifecycleState !== 'destroyed') enterFallback()
  }

  canvas.addEventListener('webglcontextlost', onContextLost)
  photo.addEventListener('error', onPhotoError)
  if (photo.complete && photo.naturalWidth === 0) onPhotoError()
  reducedMotionMedia.addEventListener('change', onReducedMotionChange)
  observer.observe(canvas)
  applyViewport()

  return {
    onProgress: (progress) => fadeTimeline.progress(progress),
    start: () => {
      if (destroyed || lifecycleState === 'fallback') return
      requestedRunning = true
      startLoop()
    },
    stop: () => {
      requestedRunning = false
      if (rafId === 0) return
      stopLoop()
      if (lifecycleState === 'active') renderFrame(0)
      timeMs = 0
    },
    destroy: () => {
      if (destroyed) return
      destroyed = true
      stopLoop()
      fadeTimeline.kill()
      observer.disconnect()
      canvas.removeEventListener('webglcontextlost', onContextLost)
      photo.removeEventListener('error', onPhotoError)
      reducedMotionMedia.removeEventListener('change', onReducedMotionChange)
      renderer?.destroy()
      renderer = undefined
      setLifecycleState('destroyed')
    }
  }
}
