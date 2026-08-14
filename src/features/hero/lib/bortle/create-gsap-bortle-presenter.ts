import type { HeroAnimationSnapshot, HeroConsumer } from '../contracts/hero-runtime'
import { mapProgressToBortle } from './map-progress-to-bortle'

interface CreateGsapBortlePresenterOptions {
  root: HTMLElement
}

export function createGsapBortlePresenter({ root }: CreateGsapBortlePresenterOptions): HeroConsumer {
  const classes = Array.from(root.querySelectorAll<HTMLElement>('[data-bortle-class]'))
  const indicator = root.querySelector<HTMLElement>('[data-bortle-indicator]')
  let activeLevel = ''

  return {
    project: (snapshot: HeroAnimationSnapshot) => {
      const nextLevel = String(mapProgressToBortle(snapshot.progress))
      if (nextLevel === activeLevel) return

      activeLevel = nextLevel
      classes.forEach((element) => {
        const active = element.dataset.bortleClass === nextLevel
        element.toggleAttribute('aria-current', active)
        element.toggleAttribute('data-active', active)
        if (active && indicator) indicator.style.backgroundColor = element.style.backgroundColor
      })
    },
    destroy: () => undefined
  }
}
