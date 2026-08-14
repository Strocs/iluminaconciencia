import { skyRendering } from '../../config/sky-rendering'
import type { FrameScheduler, HeroLifecycle, NightSkyViewport, ProgressChannel } from '../contracts/hero-runtime'
import { createLightPollutionRenderer } from './light-pollution-renderer'
import { createNightSkyScene } from './night-sky-scene'
import { createStarFieldRenderer } from './star-field-renderer'

interface CreateNightSkyOptions {
  root: HTMLElement
  progress: ProgressChannel
  scheduler: FrameScheduler
}

export function createNightSky({ root, progress, scheduler }: CreateNightSkyOptions): HeroLifecycle {
  const starCanvas = root.querySelector<HTMLCanvasElement>(skyRendering.starCanvasSelector)
  const pollutionCanvas = root.querySelector<HTMLCanvasElement>(skyRendering.lightPollutionCanvasSelector)
  if (!starCanvas || !pollutionCanvas) return { destroy: () => undefined }

  const stars = createStarFieldRenderer(starCanvas)
  const pollution = createLightPollutionRenderer(pollutionCanvas)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const getViewport = (): NightSkyViewport => {
    const { width, height } = starCanvas.getBoundingClientRect()
    return {
      width,
      height,
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, skyRendering.maximumDevicePixelRatio)
    }
  }
  const draw = (time = 0): void => {
    const scene = createNightSkyScene(progress.get(), reducedMotion, time)
    stars.draw(scene)
    pollution.draw(scene)
  }
  const resize = (): void => {
    const viewport = getViewport()
    stars.resize(viewport)
    pollution.resize(viewport)
    draw()
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(starCanvas)
  resize()

  const cancelFrame = reducedMotion ? () => undefined : scheduler.request(draw)
  const unsubscribe = progress.subscribe(() => {
    if (reducedMotion) draw()
  })

  return {
    destroy: () => {
      cancelFrame()
      unsubscribe()
      resizeObserver.disconnect()
      stars.destroy()
      pollution.destroy()
    }
  }
}
