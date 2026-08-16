export const skyRendering = {
  maximumDevicePixelRatio: 2,
  packedDataUrl: '/images/hero/hero-stars-v1.bin',
  fallbackImagePath: '/images/hero/hero-sky-fallback.svg',
  fallbackPlaceholderPath: '/images/hero/hero-sky-placeholder.svg',
  instanceCounts: [2_000, 2_200, 2_200],
  starDensityDivisor: 600,
  starCanvasSelector: '[data-hero-stars]',
  lightPollutionSelector: '[data-hero-light-pollution]',
  skyGradient: { top: '#020308', bottom: '#050814' },
  twinkle: {
    amplitude: 0.06,
    baseFrequency: 20,
    speedMultiplier: 50
  },
  starOpacity: {
    /** Opacity multiplier at the initial position (scroll progress 0) */
    initial: 0.2,
    /** Opacity multiplier when the scroll ends (progress 1) */
    final: 1
  },
  starSize: {
    /** Minimum star size in CSS px */
    min: 0.3,
    /** Maximum star size in CSS px */
    max: 10,
    /** Share of the size ramp driven by the parallax layer (0..1); the rest by per-star data */
    layerWeight: 0.4,
    /** Rarity exponent over the per-star size: 1 = uniform, higher = fewer large stars */
    rarity: 4
  },
  parallax: {
    /** Base scroll factor per star: scrollOffset = progress * baseSpeed * layer */
    baseSpeed: 0.001,
    /** Layer spread: layer = 1 + layerFlags/31 * layerSpread */
    layerSpread: 4
  },
  pollution: {
    baseColor: { red: 70, green: 83, blue: 98 },
    /** Horizon arc width in vw (200 = double viewport) */
    width: 100,
    /** Horizon arc height in lvh */
    height: 20,
    /** Horizon arc center Y position (0 = top, 100 = bottom) */
    centerY: 100,
    /** Horizon arc center opacity (0-1) */
    opacity: 1,
    /** Initial opacity before GSAP animation (0-1) */
    initialOpacity: 1
  }
} as const
