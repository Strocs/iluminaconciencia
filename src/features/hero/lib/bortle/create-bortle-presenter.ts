import type { HeroLifecycle, ProgressChannel } from '../contracts/hero-runtime';
import { mapProgressToBortle } from './map-progress-to-bortle';

interface CreateBortlePresenterOptions {
  root: HTMLElement;
  progress: ProgressChannel;
}

export function createBortlePresenter({
  root,
  progress,
}: CreateBortlePresenterOptions): HeroLifecycle {
  const classes = Array.from(root.querySelectorAll<HTMLElement>('[data-bortle-class]'));
  const indicator = root.querySelector<HTMLElement>('[data-bortle-indicator]');
  const unsubscribe = progress.subscribe((value) => {
    const activeLevel = String(mapProgressToBortle(value));

    classes.forEach((element) => {
      const active = element.dataset.bortleClass === activeLevel;
      element.toggleAttribute('aria-current', active);
      element.toggleAttribute('data-active', active);
      if (active && indicator) indicator.style.backgroundColor = element.style.backgroundColor;
    });
  });

  return { destroy: unsubscribe };
}
