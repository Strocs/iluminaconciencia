import type { HeroLifecycle } from '../contracts/hero-runtime'
import { createHeroAnimation } from '../animation/create-hero-animation'

const initializedHeroes = new WeakMap<HTMLElement, HeroLifecycle>()

export function initializeHero(root: HTMLElement): HeroLifecycle {
  const existing = initializedHeroes.get(root)
  if (existing) return existing

  const animation = createHeroAnimation(root)
  const mapAction = root.querySelector<HTMLAnchorElement>('[data-hero-map-action]')
  const handoffToMap = (): void => {
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>('#map')?.focus())
  }

  mapAction?.addEventListener('click', handoffToMap)
  const lifecycle: HeroLifecycle = {
    destroy: () => {
      mapAction?.removeEventListener('click', handoffToMap)
      animation.destroy()
      initializedHeroes.delete(root)
    }
  }

  initializedHeroes.set(root, lifecycle)
  return lifecycle
}
