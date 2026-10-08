import { HeroScene } from './HeroScene'
import { heroScenes } from './scenes-data'

export function HeroNarrative() {
  return (
    <div className="relative z-10 mx-auto h-84 w-full max-w-4xl sm:h-96 [@media(max-height:38rem)]:h-64 [@media(max-height:38rem)_and_(min-width:40rem)]:h-52 [@media(max-height:38rem)_and_(min-width:40rem)]:max-w-none [@media(max-height:38rem)_and_(min-width:40rem)]:min-w-0 [@media(max-height:38rem)_and_(min-width:40rem)]:flex-[1_1_0%]">
      <div className="relative size-full px-6">
        {heroScenes.map((scene, index) => (
          <HeroScene key={scene.id} scene={scene} index={index} />
        ))}
      </div>
    </div>
  )
}
