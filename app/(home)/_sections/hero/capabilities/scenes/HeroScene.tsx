import { LinkButton } from '@/_components/LinkButton'
import type { HeroScene as HeroSceneData } from './scenes-data'

type Props = {
  scene: HeroSceneData
  index: number
}

export function HeroScene({ scene, index }: Props) {
  return (
    <article
      className={`hero-scene absolute inset-0 flex flex-col items-center justify-center p-6 text-center max-[639px]:p-3 sm:p-10 [@media(max-height:34rem)]:p-3 ${index === 0 ? 'opacity-100' : 'opacity-0'}`}
      data-hero-scene={scene.id}
      aria-hidden={index === 0 ? undefined : true}
      inert={index === 0 ? undefined : true}
    >
      <div className="scene-content flex flex-col items-center gap-4 max-[639px]:gap-3 [@media(max-height:38rem)]:gap-2">
        <h1
          id={index === 0 ? 'hero-title' : undefined}
          className="scene-heading max-w-3xl font-heading text-5xl leading-14 font-semibold text-foreground [text-box-trim:trim-both] max-[639px]:text-3xl/9 [@media(max-height:38rem)]:text-2xl/7"
        >
          {scene.title.before}
          <span className="text-primary">{scene.title.highlight}</span>
          {scene.title.after}
        </h1>
        {scene.copy && (
          <p className="scene-copy max-w-lg font-body text-base leading-6 font-normal text-text max-[639px]:text-sm/5 [@media(max-height:38rem)]:text-xs/4">
            {scene.copy}
          </p>
        )}
        <LinkButton variant="important" href={scene.cta.href}>
          {scene.cta.label}
        </LinkButton>
      </div>
    </article>
  )
}
