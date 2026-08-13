import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const narrative = document.querySelector<HTMLElement>('.hero-narrative');
if (narrative && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const messages = gsap.utils.toArray<HTMLElement>('[data-hero-message]');
  const opening = narrative.querySelector<HTMLElement>('.hero-narrative__opening');
  const photograph = narrative.querySelector<HTMLElement>('.hero-sky__photograph');
  const glow = narrative.querySelector<HTMLElement>('.hero-sky__glow');
  const haze = narrative.querySelector<HTMLElement>('.hero-sky__haze');
  const progress = narrative.querySelector<HTMLElement>('.hero-progress span');
  const primaryCta = narrative.querySelector<HTMLElement>(
    '.hero-narrative__footer .button-primary',
  );

  gsap.set(messages, { autoAlpha: 0, filter: 'blur(8px)' });

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: narrative,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
    },
  });
  timeline.to(opening, {
    autoAlpha: 0,
    filter: 'blur(8px)',
    duration: 0.08,
  });
  const messageLabels = ['message0', 'message1', 'message2', 'closing'];
  const messagePositions = [0.12, 0.34, 0.56, 0.78];
  messages.forEach((message, index) => {
    const label = messageLabels[index];
    const position = messagePositions[index];
    timeline.addLabel(label, position);
    timeline.to(
      message,
      {
        autoAlpha: 1,
        filter: 'blur(0px)',
        duration: 0.08,
      },
      label,
    );
    if (index > 0) {
      timeline.to(
        messages[index - 1],
        {
          autoAlpha: 0,
          filter: 'blur(8px)',
          duration: 0.08,
        },
        label,
      );
    }
  });
  timeline.to(
    photograph,
    { filter: 'blur(0px) saturate(0.95) contrast(1.08) brightness(0.68)', duration: 1 },
    0,
  );
  timeline.to(glow, { autoAlpha: 0.16, duration: 1 }, 0.12);
  timeline.to(haze, { autoAlpha: 0.2, duration: 1 }, 0.12);
  timeline.to(progress, { scaleX: 1, duration: 1 }, 0);
  timeline.to(
    primaryCta,
    {
      boxShadow: '0 0 0 0.35rem #f4bd6333, 0 0.75rem 2rem #00000033',
      duration: 0.12,
    },
    0.82,
  );
}
