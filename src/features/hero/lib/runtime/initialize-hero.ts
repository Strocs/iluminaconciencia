import type { HeroLifecycle } from '../contracts/hero-runtime';
import { createBortlePresenter } from '../bortle/create-bortle-presenter';
import { createNightSky } from '../night-sky/create-night-sky';
import { createProgressChannel } from '../progress/progress-channel';
import { createHeroScroll } from '../scroll/create-hero-scroll';
import { createFrameScheduler } from './frame-scheduler';

const initializedHeroes = new WeakMap<HTMLElement, HeroLifecycle>();

export function initializeHero(root: HTMLElement): HeroLifecycle {
  const existing = initializedHeroes.get(root);
  if (existing) return existing;

  const progress = createProgressChannel();
  const scheduler = createFrameScheduler(root);
  const nightSky = createNightSky({ root, progress, scheduler });
  const bortle = createBortlePresenter({ root, progress });
  const scroll = createHeroScroll({ root, progress });
  const mapAction = root.querySelector<HTMLAnchorElement>('[data-hero-map-action]');
  const handoffToMap = (): void => {
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>('#map')?.focus());
  };

  mapAction?.addEventListener('click', handoffToMap);
  const lifecycle: HeroLifecycle = {
    destroy: () => {
      mapAction?.removeEventListener('click', handoffToMap);
      scroll.destroy();
      bortle.destroy();
      nightSky.destroy();
      scheduler.destroy();
      initializedHeroes.delete(root);
    },
  };

  initializedHeroes.set(root, lifecycle);
  return lifecycle;
}
