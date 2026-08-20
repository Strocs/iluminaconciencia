export const nightSkyConfig = {
  maximumDevicePixelRatio: 2,
  fallbackImagePath: '/images/hero/hero-sky-fallback.svg',
  twinkle: {
    /** Twinkle amplitude: 0 = no twinkle, higher = stronger pulsing. */
    amplitude: 0.06,
    /** Base twinkle frequency in radians per second. */
    baseFrequency: 20,
    /** Per-star speed multiplier. */
    speedMultiplier: 50
  },
  starOpacity: {
    /** Opacity multiplier at the initial position (scroll progress 0) */
    initial: 0.2,
    /** Opacity multiplier at the full-opacity phase. */
    full: 1,
    /** Progress at which the canvas reaches full opacity. */
    fullProgress: 0.7,
    /** Progress at which the canvas begins fading out. */
    fadeOutStartProgress: 0.8,
    /** Progress at which the canvas reaches zero opacity. */
    finalProgress: 0.95,
    /** Opacity multiplier after the fade-out completes. */
    final: 0
  }
} as const
