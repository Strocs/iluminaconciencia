import { skyRendering } from '../../config/sky-rendering'
import { prominentStars } from '../../data/prominent-stars'
import type { CanvasRenderer, NightSkyScene, NightSkyViewport } from '../contracts/hero-runtime'

interface Star {
  x: number
  y: number
  z: number
  baseSize: number
  baseAlpha: number
  color: string
  twinkleSpeed: number
  twinkleOffset: number
  isMoving: boolean
}

export function createStarFieldRenderer(canvas: HTMLCanvasElement): CanvasRenderer {
  const context = canvas.getContext('2d')
  const stars: Star[] = []
  let viewport: NightSkyViewport | null = null
  let startedAt: number | null = null

  const driftSpeeds = [0]
  for (let index = 0; index < 7; index += 1) {
    const ratio = index / 6
    driftSpeeds.push(
      Number(
        (
          skyRendering.minimumDriftSpeed +
          ratio * (skyRendering.maximumDriftSpeed - skyRendering.minimumDriftSpeed)
        ).toFixed(2)
      )
    )
  }

  const randomTwinkleSpeed = (): number =>
    skyRendering.twinkleSpeed.min + Math.random() * (skyRendering.twinkleSpeed.max - skyRendering.twinkleSpeed.min)

  const randomLayer = (): number => {
    const random = Math.random()
    return random < 0.32 ? 1 : random < 0.58 ? 2 : random < 0.78 ? 3 : random < 0.9 ? 4 : random < 0.96 ? 5 : 6
  }

  const randomAlpha = (z: number): number => {
    if (z === 1) return 0.2 + Math.random() * 0.3
    if (z === 2) return 0.35 + Math.random() * 0.35
    if (z === 3) return 0.5 + Math.random() * 0.35
    if (z === 4) return 0.65 + Math.random() * 0.3
    if (z === 5) return 0.8 + Math.random() * 0.2
    return 0.9 + Math.random() * 0.1
  }

  const populate = (): void => {
    if (!viewport) return
    const activeViewport = viewport
    stars.length = 0
    const count = Math.min(
      skyRendering.desktopStarLimit,
      Math.floor((activeViewport.width * activeViewport.height) / skyRendering.starDensityDivisor)
    )

    prominentStars.forEach((star) => {
      const magnitude = Math.max(0, Math.min(1, (3.5 - star.magnitude) / 5))
      const range = skyRendering.layerStarSizes[6]
      stars.push({
        x: star.xRatio * activeViewport.width,
        y: star.yRatio * activeViewport.height,
        z: 7,
        baseSize: range.min + magnitude * (range.max - range.min),
        baseAlpha: 0.95,
        twinkleSpeed: randomTwinkleSpeed(),
        twinkleOffset: Math.random() * Math.PI * 2,
        color: star.color,
        isMoving: Math.random() < skyRendering.movingStarsRatio
      })
    })

    for (let index = 0; index < count; index += 1) {
      const z = randomLayer()
      const range = skyRendering.layerStarSizes[z - 1]
      stars.push({
        x: Math.random() * activeViewport.width,
        y: Math.random() * activeViewport.height,
        z,
        baseSize: range.min + Math.random() * (range.max - range.min),
        baseAlpha: randomAlpha(z),
        twinkleSpeed: randomTwinkleSpeed(),
        twinkleOffset: Math.random() * Math.PI * 2,
        color: skyRendering.starColors[Math.floor(Math.random() * skyRendering.starColors.length)],
        isMoving: Math.random() < skyRendering.movingStarsRatio
      })
    }
  }

  return {
    resize: (nextViewport) => {
      viewport = nextViewport
      canvas.width = Math.round(nextViewport.width * nextViewport.devicePixelRatio)
      canvas.height = Math.round(nextViewport.height * nextViewport.devicePixelRatio)
      context?.setTransform(nextViewport.devicePixelRatio, 0, 0, nextViewport.devicePixelRatio, 0, 0)
      startedAt = null
      populate()
    },
    draw: (scene: NightSkyScene) => {
      if (!context || !viewport) return
      const activeViewport = viewport
      const time = ((scene.animationTime - (startedAt ?? scene.animationTime)) / 1000) * 0.12
      startedAt ??= scene.animationTime
      const sky = context.createLinearGradient(0, 0, 0, activeViewport.height)
      sky.addColorStop(0, skyRendering.skyGradient.top)
      sky.addColorStop(1, skyRendering.skyGradient.bottom)
      context.fillStyle = sky
      context.fillRect(0, 0, activeViewport.width, activeViewport.height)
      const yShift = scene.progress * activeViewport.height * 1.35
      const fieldAlpha = Math.max(0, (1 - scene.progress) * 1.05)
      const fadeHeight = Math.max(220, activeViewport.height * 0.35)
      const topFadeStart = yShift - fadeHeight
      stars.forEach((star) => {
        const group = Math.min(driftSpeeds.length - 1, Math.max(1, star.z))
        const drift = (time * driftSpeeds[group]) % activeViewport.height
        let y = (star.y - drift - scene.progress * skyRendering.parallaxOffsets[group]) % activeViewport.height
        if (y < 0) y += activeViewport.height
        const dx = star.isMoving ? Math.sin(time * 0.1 + star.twinkleOffset) * 0.2 : 0
        const dy = star.isMoving ? Math.cos(time * 0.1 + star.twinkleOffset) * 0.2 : 0
        const coverage =
          y + dy >= topFadeStart
            ? fieldAlpha * Math.min(1, Math.max(0, (y + dy - topFadeStart) / (fadeHeight + 100)))
            : 0
        const visibility =
          star.z <= 2
            ? Math.max(0, 1 - coverage * 0.95)
            : star.z <= 4
              ? Math.max(0.12, 1 - coverage * 0.7)
              : Math.max(0.35, 1 - coverage * 0.35)
        const twinkle = Math.sin(time * star.twinkleSpeed * 800 + star.twinkleOffset)
        const alpha = Math.max(0.04, Math.min(1, (star.baseAlpha + twinkle * 0.18) * visibility))
        const size = star.baseSize * (0.9 + (twinkle + 1) * 0.1)
        context.globalAlpha = alpha * scene.starVisibility
        context.fillStyle = star.color
        context.beginPath()
        context.arc(star.x + dx, y + dy, size, 0, Math.PI * 2)
        context.fill()
        if (star.z >= 5 && alpha > 0.4) {
          context.globalAlpha = alpha * 0.25 * visibility * scene.starVisibility
          context.beginPath()
          context.arc(star.x + dx, y + dy, size * 2.6, 0, Math.PI * 2)
          context.fill()
        }
      })
      context.globalAlpha = 1
    },
    destroy: () => {
      stars.length = 0
      canvas.width = 0
      canvas.height = 0
    }
  }
}
