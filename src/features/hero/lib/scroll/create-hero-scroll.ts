import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { HeroLifecycle, ProgressChannel } from '../contracts/hero-runtime';

interface CreateHeroScrollOptions {
  root: HTMLElement;
  progress: ProgressChannel;
}

const sceneTransition = {
  firstFadeStart: 0.1,
  lastVisibleTarget: 0.8,
  fadeDuration: 0.05,
  overlap: 0.025,
  verticalOffset: 24,
} as const;

interface SceneVisualState {
  opacity: number;
  y: number;
}

function transitionProgress(value: number, start: number, duration: number): number {
  return Math.min(1, Math.max(0, (value - start) / duration));
}

function getSceneVisualState(index: number, count: number, progress: number): SceneVisualState {
  const ease = gsap.parseEase('power1.inOut');
  const { fadeDuration, firstFadeStart, lastVisibleTarget, overlap, verticalOffset } =
    sceneTransition;
  const firstFadeInStart = firstFadeStart + fadeDuration - overlap;
  const lastFadeInStart = Math.max(firstFadeInStart, lastVisibleTarget - fadeDuration);
  const step = count > 2 ? (lastFadeInStart - firstFadeInStart) / (count - 2) : 0;

  if (index === 0) {
    const value = ease(transitionProgress(progress, firstFadeStart, fadeDuration));
    return { opacity: 1 - value, y: -verticalOffset * value };
  }

  if (index === count - 1) {
    const value = ease(transitionProgress(progress, lastFadeInStart, fadeDuration));
    return { opacity: value, y: verticalOffset * (1 - value) };
  }

  const fadeInStart = firstFadeInStart + (index - 1) * step;
  const fadeOutStart = firstFadeInStart + index * step - fadeDuration + overlap;
  const fadeIn = ease(transitionProgress(progress, fadeInStart, fadeDuration));
  const fadeOut = ease(transitionProgress(progress, fadeOutStart, fadeDuration));
  return {
    opacity: fadeIn * (1 - fadeOut),
    y: verticalOffset * (1 - fadeIn) - verticalOffset * fadeOut,
  };
}

export function createHeroScroll({ root, progress }: CreateHeroScrollOptions): HeroLifecycle {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return { destroy: () => undefined };

  gsap.registerPlugin(ScrollTrigger);
  const scenes = Array.from(root.querySelectorAll<HTMLElement>('[data-hero-scene]'));
  const actions = root.querySelector<HTMLElement>('[data-hero-actions]');
  const update = (value: number): void => {
    progress.set(value);
    const visualStates = scenes.map((_, index) => getSceneVisualState(index, scenes.length, value));
    const activeIndex = visualStates.reduce(
      (active, state, index) => (state.opacity > visualStates[active].opacity ? index : active),
      0,
    );

    scenes.forEach((scene, index) => {
      const active = index === activeIndex;
      gsap.set(scene, { autoAlpha: visualStates[index].opacity, y: visualStates[index].y });
      scene.setAttribute('aria-hidden', String(!active));
      scene.toggleAttribute('inert', !active);
    });

    const showActions = activeIndex === scenes.length - 1;
    actions?.toggleAttribute('hidden', !showActions);
    actions?.toggleAttribute('inert', !showActions);
    actions?.setAttribute('aria-hidden', String(!showActions));
  };
  const trigger = ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      update(self.progress);
    },
  });

  update(trigger.progress);

  return { destroy: () => trigger.kill() };
}
