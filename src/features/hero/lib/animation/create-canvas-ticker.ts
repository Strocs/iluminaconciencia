import { gsap } from 'gsap'
import type { CanvasTicker, NightSkyConsumer, NightSkyFrame } from '../contracts/hero-runtime'

interface CreateCanvasTickerOptions {
  consumers: readonly NightSkyConsumer[]
  getProgress: () => NightSkyFrame['progress']
}

export function createCanvasTicker({ consumers, getProgress }: CreateCanvasTickerOptions): CanvasTicker {
  let running = false
  const draw = (timeSeconds: number): void => {
    const frame = Object.freeze({ progress: getProgress(), animationTimeMs: timeSeconds * 1000 })
    consumers.forEach((consumer) => consumer.draw(frame))
  }

  return {
    start: () => {
      if (running) return
      running = true
      gsap.ticker.add(draw)
    },
    stop: (finalFrame) => {
      if (finalFrame) consumers.forEach((consumer) => consumer.draw(finalFrame))
      if (!running) return
      running = false
      gsap.ticker.remove(draw)
    },
    destroy: () => {
      if (running) gsap.ticker.remove(draw)
      running = false
    }
  }
}
