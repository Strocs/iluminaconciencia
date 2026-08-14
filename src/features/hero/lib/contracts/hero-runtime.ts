declare const normalizedProgress: unique symbol

export type NormalizedProgress = number & { readonly [normalizedProgress]: true }

export type ProgressListener = (progress: NormalizedProgress) => void
export type FrameCallback = (time: number) => void

export interface HeroLifecycle {
  destroy(): void
}

export interface ProgressChannel {
  get(): NormalizedProgress
  set(value: number): void
  subscribe(listener: ProgressListener): () => void
}

export interface NightSkyViewport {
  width: number
  height: number
  devicePixelRatio: number
}

export interface NightSkyScene {
  progress: NormalizedProgress
  starVisibility: number
  lightPollution: number
  animationTime: number
}

export interface CanvasRenderer extends HeroLifecycle {
  resize(viewport: NightSkyViewport): void
  draw(scene: NightSkyScene): void
}

export interface FrameScheduler extends HeroLifecycle {
  request(render: FrameCallback): () => void
}
