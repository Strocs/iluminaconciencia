import type { HeroSkyLifecycleState, NightSkyFrame } from '../contracts/hero-runtime'

const timingSampleCapacity = 120

interface HeroSkyDiagnosticsOptions {
  readonly canvas: HTMLCanvasElement
  readonly getLifecycleState: () => HeroSkyLifecycleState
  readonly setFixedFrame: (frame: NightSkyFrame | undefined) => void
  readonly forceInitializationFailure: () => void
  readonly forceContextLoss: () => void
}

export interface HeroSkyDiagnosticsSnapshot {
  readonly lifecycleState: HeroSkyLifecycleState
  readonly fixedFrame?: NightSkyFrame
  readonly drawCallCount: number
  readonly timingSamplesMs: readonly number[]
}

export interface HeroSkyDiagnostics {
  setFixedProgress(progress?: number): void
  setFixedAnimationTime(animationTimeMs?: number): void
  forceInitializationFailure(): void
  forceContextLoss(): void
  getSnapshot(): HeroSkyDiagnosticsSnapshot
  destroy(): void
}

export interface HeroSkyDiagnosticsRecorder extends HeroSkyDiagnostics {
  recordDraw(durationMs: number): void
}

declare global {
  interface Window {
    __CALUZ_HERO_SKY_DIAGNOSTICS__?: HeroSkyDiagnostics
  }
}

const clampProgress = (value: number): number => Math.min(1, Math.max(0, value))

export function createHeroSkyDiagnostics(options: HeroSkyDiagnosticsOptions): HeroSkyDiagnosticsRecorder {
  const timingSamples = new Float64Array(timingSampleCapacity)
  let fixedFrame: NightSkyFrame | undefined
  let drawCallCount = 0
  let timingSampleCount = 0
  let timingSampleOffset = 0
  let destroyed = false

  const diagnostics: HeroSkyDiagnosticsRecorder = {
    setFixedProgress: (progress) => {
      if (destroyed) return
      fixedFrame =
        progress === undefined
          ? undefined
          : { ...(fixedFrame ?? { progress: 0, animationTimeMs: 0 }), progress: clampProgress(progress) }
      options.setFixedFrame(fixedFrame)
    },
    setFixedAnimationTime: (animationTimeMs) => {
      if (destroyed) return
      fixedFrame =
        animationTimeMs === undefined
          ? undefined
          : { ...(fixedFrame ?? { progress: 0, animationTimeMs: 0 }), animationTimeMs: Math.max(0, animationTimeMs) }
      options.setFixedFrame(fixedFrame)
    },
    forceInitializationFailure: () => {
      if (!destroyed) options.forceInitializationFailure()
    },
    forceContextLoss: () => {
      if (!destroyed) options.forceContextLoss()
    },
    getSnapshot: () => {
      const sampleCount = timingSampleCount
      const samples = Array.from(
        { length: sampleCount },
        (_, index) =>
          timingSamples[(timingSampleOffset - sampleCount + index + timingSampleCapacity) % timingSampleCapacity]
      )
      return {
        lifecycleState: options.getLifecycleState(),
        ...(fixedFrame === undefined ? {} : { fixedFrame }),
        drawCallCount,
        timingSamplesMs: samples
      }
    },
    recordDraw: (durationMs) => {
      if (destroyed) return
      drawCallCount += 1
      timingSamples[timingSampleOffset] = durationMs
      timingSampleOffset = (timingSampleOffset + 1) % timingSampleCapacity
      timingSampleCount = Math.min(timingSampleCapacity, timingSampleCount + 1)
    },
    destroy: () => {
      if (destroyed) return
      destroyed = true
      if (window.__CALUZ_HERO_SKY_DIAGNOSTICS__ === diagnostics) delete window.__CALUZ_HERO_SKY_DIAGNOSTICS__
    }
  }

  options.canvas.dataset.heroSkyDiagnostics = 'available'
  window.__CALUZ_HERO_SKY_DIAGNOSTICS__?.destroy()
  window.__CALUZ_HERO_SKY_DIAGNOSTICS__ = diagnostics
  return diagnostics
}
