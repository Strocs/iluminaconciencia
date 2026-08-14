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

export interface HeroSceneState {
  readonly opacity: number
  readonly y: number
}

export interface HeroAnimationSnapshot {
  readonly progress: NormalizedProgress
  readonly scenes: readonly HeroSceneState[]
}

export interface NightSkyFrame {
  readonly progress: NormalizedProgress
  readonly animationTimeMs: number
}

export interface HeroAnimationState {
  getSnapshot(): HeroAnimationSnapshot
  setProgress(value: number): HeroAnimationSnapshot
}

export interface HeroConsumer extends HeroLifecycle {
  project(snapshot: HeroAnimationSnapshot): void
}

export interface NightSkyConsumer extends HeroLifecycle {
  draw(frame: NightSkyFrame): void
  resize(): void
}

export interface CanvasTicker extends HeroLifecycle {
  start(): void
  stop(finalFrame?: NightSkyFrame): void
}
