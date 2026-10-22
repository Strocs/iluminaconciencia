import type { CSSProperties } from 'react'

/** Shared foreground geometry for the frame mask and atmospheric backlight. */

export const frontalSilhouetteGeometry = {
  viewBoxWidth: 1920,
  viewBoxHeight: 1360,
  translateY: 1051,
  contourValleyY: 237.836
} as const

export const frontalContour =
  'M0 0L17.8125 11.2364L45.9375 7.49091L61.875 14.9818L75 12.1727L89.0625 13.1091L125.625 35.5818L148.125 28.0909L156.562 30.9L183.75 45.8818L188.438 46.8182L200.625 41.2H204.375L220.312 56.1818H233.438L242.812 65.5455H246.562L263.438 57.1182L270.938 56.1818L316.875 81.4636L364.688 97.3818L409.688 98.3182L448.125 104.873L510.938 112.364L544.688 136.709L568.125 149.818L654.375 162.927H675L692.812 158.245H706.875L721.875 161.991L745.312 159.182L810.938 173.227L824.062 184.464L869.062 198.509L889.688 228.473H996.562L1034.06 237.836H1038.75L1068.75 226.6L1089.38 220.982L1137.19 216.3L1187.81 192.891H1203.75L1212.19 191.018L1248.75 201.318L1282.5 167.609L1338.75 149.818L1365.94 148.882L1395.94 154.5H1410L1466.25 147.009L1501.88 122.664L1545.94 106.745L1597.5 93.6364L1642.5 66.4818L1664.06 61.8L1694.06 49.6273L1713.75 50.5636L1747.5 55.2455H1770L1796.25 38.3909L1816.88 34.6455L1845.94 37.4545L1880.62 30.9L1896.56 24.3455L1906.88 13.1091L1919.06 9.36364'

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
