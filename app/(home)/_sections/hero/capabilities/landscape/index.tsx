import { DistantHills } from './DistantHills'
import { MiddleHills } from './MiddleHills'

export function HeroLandscape() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <DistantHills />
      <MiddleHills />
    </div>
  )
}
