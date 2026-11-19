import type { CSSProperties } from 'react'

/** Shared foreground geometry for the frame mask and atmospheric backlight. */

export const frontalSilhouetteGeometry = {
  viewBoxWidth: 1920,
  viewBoxHeight: 1360,
  translateY: 1051,
  contourValleyY: 237.836
} as const

export const frontalContour =
  'M0 18L46 9L88 2L124 0L161 9L196 24L242 33L287 46L333 65L372 73L413 68L452 76L499 98L548 124L603 143L661 156L722 163L774 176L821 194L864 211L907 224L952 233L997 237L1036 237.836L1073 232L1105 219L1137 200L1165 181L1195 169L1228 164L1263 169L1299 175L1330 163L1360 141L1393 122L1430 112L1470 108L1510 96L1548 75L1585 54L1624 43L1660 44L1696 52L1733 56L1770 49L1808 34L1846 25L1885 23L1919.06 9.36364'

export const frontalSilhouette = {
  fill: '#000000',
  d: `${frontalContour}L1920 309H0V0Z`
}

const { viewBoxWidth, viewBoxHeight, translateY, contourValleyY } = frontalSilhouetteGeometry
const valleyBottomGap = viewBoxHeight - translateY - contourValleyY

export const landscapeStyle = {
  '--hero-art-width': 'min(120rem, 250vw)',
  '--hero-art-height': 'calc(var(--hero-art-width) * 17 / 24)',
  '--hero-art-offset-y': 'calc(var(--hero-art-width) * 182.5 / 2400)',
  '--hero-nearest-mask-offset-y': `calc(var(--hero-art-width) * ${valleyBottomGap} / ${viewBoxWidth} - 5vh)`
} as CSSProperties
