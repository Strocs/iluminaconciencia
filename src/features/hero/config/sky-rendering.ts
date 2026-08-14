export const skyRendering = {
  maximumDevicePixelRatio: 2,
  desktopStarLimit: 2200,
  starDensityDivisor: 600,
  starCanvasSelector: '[data-hero-stars]',
  lightPollutionCanvasSelector: '[data-hero-light-pollution]',
  starColors: ['#ffffff', '#ffffff', '#cce7ff', '#a3c2ff', '#ffe3a0', '#ffc890', '#ffb3b3'],
  skyGradient: { top: '#020308', bottom: '#050814' },
  layerStarSizes: [
    { min: 0.1, max: 0.2 },
    { min: 0.3, max: 0.4 },
    { min: 0.4, max: 0.6 },
    { min: 0.6, max: 0.8 },
    { min: 0.9, max: 1 },
    { min: 1, max: 1.1 },
    { min: 1.2, max: 2.2 }
  ],
  parallaxOffsets: [0, 3, 9, 16, 24, 32, 38, 46],
  minimumDriftSpeed: 0.2,
  maximumDriftSpeed: 6.2,
  twinkleSpeed: { min: 0.02, max: 0.04 },
  movingStarsRatio: 0.12,
  pollution: {
    baseColor: { red: 70, green: 83, blue: 98 },
    intensity: 1,
    maximumAlpha: 1,
    fadeHeightRatio: 1,
    yShiftFactor: 1.2,
    backdropBlurPixels: 2
  }
} as const
