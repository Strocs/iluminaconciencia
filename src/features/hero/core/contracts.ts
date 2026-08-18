export interface HeroLifecycle {
  destroy(): void
}

export interface HeroCapability {
  onProgress(progress: number): void
  destroy(): void
}