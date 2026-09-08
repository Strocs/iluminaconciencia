import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { HeroLifecycle } from '../../core/contracts'
import { heroExitConfig } from './config'

interface CreateHeroExitOptions {
  root: HTMLElement | null
}

const noOpLifecycle: HeroLifecycle = {
  destroy: () => undefined
}

export function createHeroExit({ root }: CreateHeroExitOptions): HeroLifecycle {
  const target = root?.querySelector<HTMLElement>('[data-hero-exit-layer]')
  if (!root || !target) return noOpLifecycle

  gsap.registerPlugin(ScrollTrigger)
  const tween = gsap.to(target, {
    autoAlpha: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: root,
      start: heroExitConfig.start,
      end: heroExitConfig.end,
      scrub: true
    }
  })

  return {
    destroy: () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      gsap.set(target, { clearProps: 'opacity,visibility' })
    }
  }
}
