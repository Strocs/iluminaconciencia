import type { CSSProperties } from 'react'
import { frontalContour, frontalSilhouette, frontalSilhouetteGeometry } from '../../landscape'
import { lightPollutionConfig } from './config'

const { palette, horizon, backlight } = lightPollutionConfig
const { viewBoxWidth, viewBoxHeight, translateY } = frontalSilhouetteGeometry

// Blur a filled sky surface, then retain only its spill onto the mountain.
// Unlike a blurred stroke, this does not thin out at bends in the contour.
const skySurface = `${frontalContour}L${viewBoxWidth} ${-translateY}H0Z`
const backlightSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${viewBoxWidth}" height="${viewBoxHeight}" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}">
  <defs>
    <linearGradient id="falloff">
      <stop stop-color="white" stop-opacity="${0.15 / backlight.centerBoost}"/>
      <stop offset="0.3" stop-color="white" stop-opacity="${0.66 / backlight.centerBoost}"/>
      <stop offset="0.5" stop-color="white"/>
      <stop offset="0.7" stop-color="white" stop-opacity="${0.66 / backlight.centerBoost}"/>
      <stop offset="1" stop-color="white" stop-opacity="${0.15 / backlight.centerBoost}"/>
    </linearGradient>
    <mask id="intensity"><rect width="100%" height="100%" fill="url(#falloff)"/></mask>
    <clipPath id="mountain"><path d="${frontalSilhouette.d}" transform="translate(0 ${translateY})"/></clipPath>
    <filter id="halo" filterUnits="userSpaceOnUse" x="0" y="0" width="${viewBoxWidth}" height="${viewBoxHeight}" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="${backlight.haloBlur}"/>
    </filter>
    <filter id="rim" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="${backlight.rimBlur}"/>
    </filter>
  </defs>
  <g mask="url(#intensity)">
    <g clip-path="url(#mountain)">
      <g filter="url(#halo)">
        <path d="${skySurface}" transform="translate(0 ${translateY})" fill="${palette.source}" opacity="${backlight.haloOpacity * backlight.centerBoost}"/>
      </g>
    </g>
    <path d="${frontalContour}" transform="translate(0 ${translateY})" fill="none" stroke="color-mix(in srgb, ${palette.source}, white ${backlight.rimWhiteMix * 100}%)" stroke-linejoin="round" stroke-width="${backlight.rimWidth}" opacity="${backlight.rimOpacity * backlight.centerBoost}" filter="url(#rim)"/>
  </g>
</svg>`
const backlightImage = `url("data:image/svg+xml,${encodeURIComponent(backlightSvg)}")`

export function AtmosphereCanvas() {
  return (
    <canvas
      data-hero-atmosphere
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full"
      style={{ visibility: 'hidden' }}
    />
  )
}

export function LightPollution() {
  return (
    <div
      data-hero-light-pollution-horizon
      className="pointer-events-none absolute inset-0"
      style={
        {
          '--horizon-color': palette.source,
          opacity: horizon.initialOpacity
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_150%_125%_at_50%_100%,var(--horizon-color)_0%,color-mix(in_srgb,var(--horizon-color)_75%,transparent)_35%,color-mix(in_srgb,var(--horizon-color)_35%,transparent)_70%,transparent_100%)] sm:bg-[radial-gradient(ellipse_100%_120%_at_50%_96%,var(--horizon-color)_0%,color-mix(in_srgb,var(--horizon-color)_75%,transparent)_35%,color-mix(in_srgb,var(--horizon-color)_35%,transparent)_70%,transparent_100%)]" />
    </div>
  )
}

export function LightPollutionBacklight() {
  return (
    <div
      data-hero-light-pollution-backlight
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-(image:--backlight-image) bg-size-[var(--hero-art-width)_var(--hero-art-height)] bg-position-[center_calc(100%+var(--hero-nearest-mask-offset-y))] bg-no-repeat"
      style={{ '--backlight-image': backlightImage, opacity: horizon.initialOpacity } as CSSProperties}
    />
  )
}
