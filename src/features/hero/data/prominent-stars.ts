export interface ProminentStar {
  xRatio: number
  yRatio: number
  magnitude: number
  color: string
}

export const prominentStars: readonly ProminentStar[] = [
  { xRatio: 0.53, yRatio: 0.5, magnitude: 0.12, color: '#cce7ff' },
  { xRatio: 0.48, yRatio: 0.32, magnitude: 0.42, color: '#ffb3b3' },
  { xRatio: 0.78, yRatio: 0.18, magnitude: 3.35, color: '#a3c2ff' },
  { xRatio: 0.65, yRatio: 0.35, magnitude: 1.25, color: '#ffffff' },
  { xRatio: 0.18, yRatio: 0.22, magnitude: 1.79, color: '#ffe3a0' },
  { xRatio: 0.3, yRatio: 0.15, magnitude: 1.98, color: '#ffffff' },
  { xRatio: 0.7, yRatio: 0.25, magnitude: 0.03, color: '#a3c2ff' },
  { xRatio: 0.38, yRatio: 0.6, magnitude: -1.46, color: '#cce7ff' },
  { xRatio: 0.25, yRatio: 0.55, magnitude: 0.34, color: '#ffe3a0' },
  { xRatio: 0.82, yRatio: 0.5, magnitude: 0.77, color: '#ffffff' }
]
