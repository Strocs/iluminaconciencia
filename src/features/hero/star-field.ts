const STAR_COUNT = 34;

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  phase: number;
  speed: number;
}

const canvas = document.querySelector<HTMLCanvasElement>('.hero-sky__canvas');
const hero = document.querySelector<HTMLElement>('.hero-narrative');

if (canvas && hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const context = canvas.getContext('2d');
  const stars: Star[] = [];
  let frame = 0;
  let visible = true;

  if (context) {
    const resize = (): void => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const bounds = canvas.getBoundingClientRect();
      canvas.width = Math.floor(bounds.width * dpr);
      canvas.height = Math.floor(bounds.height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars.length = 0;
      const count = window.innerWidth < 700 ? 18 : STAR_COUNT;
      for (let index = 0; index < count; index += 1) {
        stars.push({
          x: Math.random() * bounds.width,
          y: Math.random() * bounds.height * 0.82,
          radius: 0.45 + Math.random() * 1.35,
          alpha: 0.22 + Math.random() * 0.46,
          phase: Math.random() * Math.PI * 2,
          speed: 0.00015 + Math.random() * 0.00025,
        });
      }
    };

    const draw = (time: number): void => {
      if (!visible) return;
      const bounds = canvas.getBoundingClientRect();
      context.clearRect(0, 0, bounds.width, bounds.height);
      for (const star of stars) {
        const pulse = star.alpha + Math.sin(time * star.speed + star.phase) * 0.08;
        context.fillStyle = `rgba(255, 244, 214, ${Math.max(0.08, pulse)})`;
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fill();
      }
      frame = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible && frame === 0) frame = requestAnimationFrame(draw);
      if (!visible) cancelAnimationFrame(frame);
      if (!visible) frame = 0;
    });
    observer.observe(hero);
    window.addEventListener('resize', resize, { passive: true });
    resize();
    frame = requestAnimationFrame(draw);
  }
}
