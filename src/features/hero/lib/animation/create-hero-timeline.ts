import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { heroMotion } from '../../config/hero-motion'
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
  const trigger = ScrollTrigger.create({
    trigger: root,
    start: heroMotion.scroll.start,
    end: heroMotion.scroll.end,
    animation: timeline.to(playhead, { progress: 1, duration: heroMotion.duration, ease: 'none' }),
    scrub: true,
    onEnter: () => ticker.start(),
    onEnterBack: () => ticker.start(),
    onLeave: () => drawBoundary(1),
    onLeaveBack: () => drawBoundary(0)
  })

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
