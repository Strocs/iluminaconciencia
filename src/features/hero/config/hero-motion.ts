export const heroMotion = {
  sceneTransitionDuration: 0.05,
  sceneOverlap: 0.025,
  scrollPromptAnimation: 'hero-prompt',
  duration: 1,
  scroll: {
    start: 'top top',
    end: 'bottom bottom'
  },
  scene: {
    firstFadeStart: 0.1,
    lastVisibleTarget: 0.8,
    fadeDuration: 0.05,
    overlap: 0.025,
    verticalOffset: 24
  }
} as const
