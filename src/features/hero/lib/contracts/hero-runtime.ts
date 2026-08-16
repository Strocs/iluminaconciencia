import type { PackedStarData, StarInstanceLevel } from '../night-sky/packed-star-data'

export interface HeroLifecycle {
  destroy(): void
}

export interface NightSkyViewport {
  width: number
  height: number
  devicePixelRatio: number
}

export interface NightSkyScene {
  progress: number
  animationTime: number
}

export interface HeroSceneState {
  readonly opacity: number
  readonly y: number
}

export interface HeroAnimationSnapshot {
  readonly progress: number
  readonly scenes: readonly HeroSceneState[]
}

export interface NightSkyFrame {
  readonly progress: number
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

export type HeroSkyLifecycleState = 'initializing' | 'active' | 'fallback' | 'destroyed'

export interface HeroSkyRenderer extends HeroLifecycle {
  resize(viewport: NightSkyViewport): void
  draw(scene: NightSkyScene): void
  setInstanceCount(count: StarInstanceLevel): void
}

export interface HeroSkyController extends NightSkyConsumer {
  readonly lifecycleState: HeroSkyLifecycleState
}

export interface HeroSkyAssets {
  readonly packedStarData: PackedStarData
}

export interface HeroSkyAssetLoadRequest {
  readonly packedDataUrl: string
  readonly generation: number
  readonly signal?: AbortSignal
  readonly isCurrentGeneration?: (generation: number) => boolean
}

export type HeroSkyAssetLoadErrorCode = 'aborted' | 'stale' | 'invalid-url' | 'fetch-failed' | 'decode-failed'

export interface HeroSkyAssetLoadFailure {
  readonly ok: false
  readonly generation: number
  readonly error: {
    readonly code: HeroSkyAssetLoadErrorCode
    readonly cause?: unknown
  }
}

export interface HeroSkyAssetLoadSuccess {
  readonly ok: true
  readonly generation: number
  readonly assets: HeroSkyAssets
}

export type HeroSkyAssetLoadResult = HeroSkyAssetLoadSuccess | HeroSkyAssetLoadFailure

export interface HeroSkyAssetLoader {
  load(request: HeroSkyAssetLoadRequest): Promise<HeroSkyAssetLoadResult>
}
