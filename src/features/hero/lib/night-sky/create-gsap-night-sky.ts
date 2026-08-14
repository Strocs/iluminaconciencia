import { skyRendering } from '../../config/sky-rendering'
import type { NightSkyConsumer, NightSkyFrame, NightSkyViewport } from '../contracts/hero-runtime'
import { createLightPollutionRenderer } from './light-pollution-renderer'
import { createStarFieldRenderer } from './star-field-renderer'

const NIGHT_SKY_KINDS = {
  STARS: 'stars',
  POLLUTION: 'pollution'
} as const

type NightSkyKind = (typeof NIGHT_SKY_KINDS)[keyof typeof NIGHT_SKY_KINDS]

interface CreateGsapNightSkyOptions {
  canvas: HTMLCanvasElement
  kind: NightSkyKind
}

export function createGsapNightSky({ canvas, kind }: CreateGsapNightSkyOptions): NightSkyConsumer {
  const renderer =
    kind === NIGHT_SKY_KINDS.STARS ? createStarFieldRenderer(canvas) : createLightPollutionRenderer(canvas)
  const getViewport = (): NightSkyViewport => {
    const { width, height } = canvas.getBoundingClientRect()
    return {
      width,
      height,
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, skyRendering.maximumDevicePixelRatio)
    }
  }
  let progress = 0
  const redraw = (): void => {
    renderer.draw({
      progress,
      starVisibility: 1,
      lightPollution: 1 - progress,
      animationTime: 0
    })
  }
  const resize = (): void => {
    renderer.resize(getViewport())
    redraw()
  }
  const observer = new ResizeObserver(resize)
  let destroyed = false
  observer.observe(canvas)
  resize()

  return {
    draw: (frame: NightSkyFrame) => {
      progress = frame.progress
      renderer.draw({
        progress,
        starVisibility: 1,
        lightPollution: 1 - progress,
        animationTime: frame.animationTimeMs
      })
    },
    resize,
    destroy: () => {
      if (destroyed) return
      destroyed = true
      observer.disconnect()
      renderer.destroy()
    }
  }
}
