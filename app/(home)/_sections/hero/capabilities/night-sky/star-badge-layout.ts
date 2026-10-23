export interface BadgeBox {
  x: number
  y: number
  width: number
  height: number
}

export const boxesOverlap = (a: BadgeBox, b: BadgeBox): boolean =>
  a.x < b.x + b.width + 4 && a.x + a.width + 4 > b.x && a.y < b.y + b.height + 4 && a.y + a.height + 4 > b.y

/** Prefer the nearest free corner; flip and clamp before looking further up/down. */
export function placeStarBadge(
  point: { x: number; y: number; radius: number },
  width: number,
  height: number,
  viewport: { width: number; height: number },
  occupied: readonly BadgeBox[]
): BadgeBox | null {
  const padding = 8
  if (width > viewport.width - padding * 2 || height > viewport.height - padding * 2) return null
  const gap = point.radius + 6
  const clampX = (x: number) => Math.max(padding, Math.min(viewport.width - width - padding, x))
  const clampY = (y: number) => Math.max(padding, Math.min(viewport.height - height - padding, y))
  const xs = [clampX(point.x + gap), clampX(point.x - gap - width)]
  const ys = [clampY(point.y - height - gap), clampY(point.y + gap)]
  for (let step = 0; step < viewport.height / (height + padding); step += 1) {
    for (const y of [ys[0] - step * (height + padding), ys[1] + step * (height + padding)]) {
      if (y < padding || y + height > viewport.height - padding) continue
      for (const x of xs) {
        const box = { x, y, width, height }
        if (!occupied.some((other) => boxesOverlap(box, other))) return box
      }
    }
  }
  return null
}
