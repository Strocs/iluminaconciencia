import type { FrameCallback, FrameScheduler } from '../contracts/hero-runtime';

export function createFrameScheduler(root: HTMLElement): FrameScheduler {
  const callbacks = new Set<FrameCallback>();
  let animationFrame: number | null = null;
  let destroyed = false;
  let rootVisible = false;

  const canRender = (): boolean => !destroyed && rootVisible && !document.hidden;
  const schedule = (): void => {
    if (animationFrame !== null || !canRender() || callbacks.size === 0) return;
    animationFrame = requestAnimationFrame(render);
  };
  const render = (time: number): void => {
    animationFrame = null;
    if (!canRender()) return;

    callbacks.forEach((callback) => callback(time));
    schedule();
  };
  const stop = (): void => {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
  };
  const onVisibilityChange = (): void => {
    if (canRender()) schedule();
    else stop();
  };
  const observer = new IntersectionObserver(([entry]) => {
    rootVisible = entry?.isIntersecting ?? false;
    onVisibilityChange();
  });

  observer.observe(root);
  document.addEventListener('visibilitychange', onVisibilityChange);

  return {
    request: (callback: FrameCallback) => {
      callbacks.add(callback);
      schedule();
      return () => {
        callbacks.delete(callback);
        if (callbacks.size === 0) stop();
      };
    },
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      stop();
      callbacks.clear();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    },
  };
}
