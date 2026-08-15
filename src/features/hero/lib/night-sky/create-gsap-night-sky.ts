import { skyRendering } from '../../config/sky-rendering'
import type { NightSkyConsumer, NightSkyFrame, NightSkyViewport } from '../contracts/hero-runtime'
import { createStarFieldRenderer } from './star-field-renderer'

interface CreateGsapNightSkyOptions {
  canvas: HTMLCanvasElement
}

export function createGsapNightSky({ canvas }: CreateGsapNightSkyOptions): NightSkyConsumer {
  const renderer = createStarFieldRenderer(canvas)
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
