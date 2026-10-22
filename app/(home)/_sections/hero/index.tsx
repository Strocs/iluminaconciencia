import { HeroRuntime } from './components/HeroRuntime'
import { BortleScale } from './capabilities/bortle-scale'
import { HeroFrame } from './capabilities/framing'
import { LightPollution, LightPollutionBacklight } from './capabilities/light-pollution'
import { HeroSky } from './capabilities/night-sky'
import { HeroNarrative } from './capabilities/scenes'

export function Hero() {
  return (
    <HeroRuntime>
      <HeroFrame overlay={<LightPollutionBacklight />}>
        <div className="pointer-events-none absolute inset-0 z-0">
          <HeroSky />
        </div>
        <div className="pointer-events-none absolute inset-0 z-1">
          <LightPollution />
        </div>
        <div className="relative z-50 mx-auto flex size-full flex-col items-center justify-center gap-4 py-8 sm:gap-12 sm:py-16">
          <HeroNarrative />
          <BortleScale />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-[max(4rem,env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-1 sm:gap-3">
          <p className="font-body text-sm tracking-wider text-text">Desliza para descubrir</p>
          <span className="h-6 w-px bg-linear-to-b from-text to-transparent sm:h-12" aria-hidden="true" />
        </div>
      </HeroFrame>
    </HeroRuntime>
  )
}
