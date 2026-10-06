import { HeroRuntime } from './components/HeroRuntime'
import { BortleScale } from './capabilities/bortle-scale'
import { HeroFrame } from './capabilities/framing'
import { HeroLandscape } from './capabilities/landscape'
import { LightPollution } from './capabilities/light-pollution'
import { HeroSky } from './capabilities/night-sky'
import { HeroNarrative } from './capabilities/scenes'

export function Hero() {
  return (
    <HeroRuntime>
      <HeroFrame>
        <HeroSky />
        <HeroLandscape />
        <div className="pointer-events-none absolute inset-0 z-40">
          <LightPollution />
        </div>
        <div className="hero-content relative z-50 mx-auto flex size-full flex-col items-center justify-center gap-8 py-32 max-[639px]:-translate-y-9 max-[639px]:gap-6 max-[639px]:pt-16 max-[639px]:pb-40 sm:gap-12 [@media(max-height:38rem)]:gap-4 [@media(max-height:38rem)]:pt-24 [@media(max-height:38rem)]:pb-28 [@media(max-height:38rem)_and_(min-width:40rem)]:flex-row [@media(max-height:38rem)_and_(min-width:40rem)]:gap-4 [@media(max-height:38rem)_and_(min-width:40rem)]:pt-8 [@media(max-height:38rem)_and_(min-width:40rem)]:pb-14">
          <HeroNarrative />
          <BortleScale />
        </div>
        <div className="hero-scroll-indicator pointer-events-none absolute inset-x-0 bottom-8 z-50 flex flex-col items-center gap-3 max-[639px]:bottom-36 [@media(max-aspect-ratio:3/4)]:bottom-36 [@media(max-height:38rem)]:bottom-14 [@media(max-height:38rem)]:gap-1">
          <p className="font-body text-sm tracking-wider text-text">Desliza para descubrir</p>
          <span
            className="h-12 w-px bg-linear-to-b from-text to-transparent [@media(max-height:38rem)]:h-6"
            aria-hidden="true"
          />
        </div>
      </HeroFrame>
    </HeroRuntime>
  )
}
