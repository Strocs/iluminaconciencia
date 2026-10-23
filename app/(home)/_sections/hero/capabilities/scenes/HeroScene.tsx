'use client'

import { Button } from '@/_components/Button'
import { ArrowIcon } from '@/_components/icons/Arrow'
import { cn } from '@/_utils/cn'
import type { HeroScene as HeroSceneData } from './scenes-data'

type Props = {
  scene: HeroSceneData
  index: number
}

export function HeroScene({ scene, index }: Props) {
  return (
    <article
      className={cn(
        'absolute inset-0 flex flex-col items-center justify-center p-3 text-center sm:p-10 [@media(max-height:34rem)]:p-3',
        index === 0 ? 'opacity-100' : 'opacity-0'
      )}
      data-hero-scene={scene.id}
      aria-hidden={index === 0 ? undefined : true}
      inert={index === 0 ? undefined : true}
    >
      <div className="flex flex-col items-center gap-3 sm:gap-4 [@media(max-height:38rem)]:gap-2">
        <h1
          id={index === 0 ? 'hero-title' : undefined}
          className="max-w-3xl font-heading text-3xl/9 font-semibold text-foreground [text-box-trim:trim-both] sm:text-5xl/14 [@media(max-height:38rem)]:text-2xl/7 [@media(max-height:38rem)_and_(min-width:40rem)]:text-2xl/7"
        >
          {scene.title.before}
          <span className="text-primary">{scene.title.highlight}</span>
          {scene.title.after}
        </h1>
        {scene.copy && (
          <p className="max-w-lg font-body text-sm/5 font-normal text-text sm:text-base/6 [@media(max-height:38rem)]:text-xs/4 [@media(max-height:38rem)_and_(min-width:40rem)]:text-xs/4">
            {scene.copy}
          </p>
        )}
        {scene.cta.section ? (
          <Button
            as="btn"
            onClick={() => {
              const target = document.getElementById(scene.cta.section!)
              if (!target) return
              const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
              target.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' })
              target.focus({ preventScroll: true })
            }}
          >
            {scene.cta.label}
            <ArrowIcon size={20} className="pointer-events-none transition-transform duration-200 group-hover/link-button:-rotate-45 motion-reduce:transform-none motion-reduce:transition-none" />
          </Button>
        ) : (
          <Button href={scene.cta.href}>{scene.cta.label}</Button>
        )}
      </div>
    </article>
  )
}
