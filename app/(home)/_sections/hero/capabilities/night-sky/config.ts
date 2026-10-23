export const nightSkyConfig = {
  maximumDevicePixelRatio: 2,
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
    initial: 0.05,
    /** Opacity multiplier at the full-opacity phase. */
    full: 1,
    /** Progress at which the sky artwork reaches full opacity and remains there. */
    fullProgress: 0.8,
    /** Reveal slowly at first, then accelerate toward full opacity. */
    ease: 'power2.in'
  }
} as const
