import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { heroMotion } from '../../config/hero-motion'
import { lightPollutionSelector } from '../contracts/hero-dom-contracts'
import type {
  CanvasTicker,
  HeroAnimationState,
  HeroConsumer,
  HeroLifecycle,
  NightSkyFrame
} from '../contracts/hero-runtime'

interface CreateHeroTimelineOptions {
  root: HTMLElement
  state: HeroAnimationState
  consumers: readonly HeroConsumer[]
  ticker: CanvasTicker
}

export function createHeroTimeline({ root, state, consumers, ticker }: CreateHeroTimelineOptions): HeroLifecycle {
  gsap.registerPlugin(ScrollTrigger)
  const playhead = { progress: 0 }
  const timeline = gsap.timeline({
    paused: true,
    onUpdate: () => {
      const snapshot = state.setProgress(playhead.progress)
      consumers.forEach((consumer) => consumer.project(snapshot))
    }
  })
  const drawBoundary = (progress: number): void => {
    const frame: NightSkyFrame = Object.freeze({ progress, animationTimeMs: 0 })
    ticker.stop(frame)
  }
  // Light pollution is a plain scrub tween of the master timeline: GSAP owns the
  // state and the interpolation. The dome starts from the static markup baseline
  // (progress 0) and sinks/fades to --cy 1 / opacity 0.
  const pollutionElement = root.querySelector<HTMLElement>(lightPollutionSelector)
  if (pollutionElement) {
    timeline.to(pollutionElement, { '--cy': 150, opacity: 0, duration: heroMotion.duration, ease: 'none' }, 0)
  }
  const trigger = ScrollTrigger.create({
    trigger: root,
    start: heroMotion.scroll.start,
    end: heroMotion.scroll.end,
    animation: timeline.to(playhead, { progress: 1, duration: heroMotion.duration, ease: 'none' }, 0),
    scrub: true,
    onEnter: () => ticker.start(),
    onEnterBack: () => ticker.start(),
    onLeave: () => drawBoundary(1)
  })

  // Start the ticker immediately on mount. ScrollTrigger's onEnter only fires
  // when the element enters from below, not when it's already visible at load.
  // onLeave will stop it when the hero exits the viewport.
  ticker.start()

  const snapshot = state.setProgress(trigger.progress)
  consumers.forEach((consumer) => consumer.project(snapshot))

  return {
    destroy: () => {
      trigger.kill()
      timeline.kill()
      ticker.stop()
    }
  }
}
