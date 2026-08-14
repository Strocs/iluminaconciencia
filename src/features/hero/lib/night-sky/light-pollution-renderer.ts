import type { CanvasRenderer, NightSkyScene, NightSkyViewport } from '../contracts/hero-runtime'
import { skyRendering } from '../../config/sky-rendering'

export function createLightPollutionRenderer(canvas: HTMLCanvasElement): CanvasRenderer {
  const context = canvas.getContext('2d')
  let viewport: NightSkyViewport | null = null

  return {
    resize: (nextViewport) => {
      viewport = nextViewport
      canvas.width = Math.round(nextViewport.width * nextViewport.devicePixelRatio)
      canvas.height = Math.round(nextViewport.height * nextViewport.devicePixelRatio)
      context?.setTransform(nextViewport.devicePixelRatio, 0, 0, nextViewport.devicePixelRatio, 0, 0)
    },
    draw: (scene: NightSkyScene) => {
      if (!context || !viewport) return
      context.clearRect(0, 0, viewport.width, viewport.height)
      const { red, green, blue } = skyRendering.pollution.baseColor
      const progress = scene.progress
      const yShift = progress * viewport.height * skyRendering.pollution.yShiftFactor
      const alpha = Math.max(
        0,
        Math.min(1, (1 - progress) * skyRendering.pollution.intensity * skyRendering.pollution.maximumAlpha)
      )
      const fadeHeight = Math.max(60, viewport.height * skyRendering.pollution.fadeHeightRatio)
      canvas.style.backdropFilter =
        (1 - progress) * skyRendering.pollution.backdropBlurPixels > 0.05
          ? `blur(${((1 - progress) * skyRendering.pollution.backdropBlurPixels).toFixed(2)}px)`
          : 'none'
      if (alpha <= 0.001 || yShift >= viewport.height * 1.5) return
      context.save()
      context.globalAlpha = alpha
      const field = context.createLinearGradient(0, yShift - fadeHeight, 0, viewport.height)
      field.addColorStop(0, `rgba(${red}, ${green}, ${blue}, 0)`)
      field.addColorStop(
        0.35,
        `rgba(${Math.round(red * 0.95)}, ${Math.round(green * 0.95)}, ${Math.round(blue * 0.95)}, 0.35)`
      )
      field.addColorStop(0.7, `rgba(${red}, ${green}, ${blue}, 0.75)`)
      field.addColorStop(
        1,
        `rgba(${Math.round(red * 1.05)}, ${Math.round(green * 1.05)}, ${Math.round(blue * 1.05)}, 1)`
      )
      context.fillStyle = field
      context.fillRect(0, 0, viewport.width, viewport.height)
      const radialY = Math.min(viewport.height * 1.2, yShift + viewport.height * 0.5)
      const glow = context.createRadialGradient(
        viewport.width * 0.5,
        radialY,
        10,
        viewport.width * 0.5,
        radialY,
        Math.max(viewport.width, viewport.height) * 0.85
      )
      glow.addColorStop(
        0,
        `rgba(${Math.round(red * 1.15)}, ${Math.round(green * 1.15)}, ${Math.round(blue * 1.15)}, 0.6)`
      )
      glow.addColorStop(0.45, `rgba(${red}, ${green}, ${blue}, 0.3)`)
      glow.addColorStop(
        0.85,
        `rgba(${Math.round(red * 0.9)}, ${Math.round(green * 0.9)}, ${Math.round(blue * 0.8)}, 0.08)`
      )
      glow.addColorStop(1, `rgba(${Math.round(red * 0.8)}, ${Math.round(green * 0.8)}, ${Math.round(blue * 0.8)}, 0)`)
      context.fillStyle = glow
      context.fillRect(0, 0, viewport.width, viewport.height)
      context.restore()
    },
    destroy: () => {
      canvas.width = 0
      canvas.height = 0
    }
  }
}
