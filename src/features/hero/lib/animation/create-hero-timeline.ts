import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { heroMotion } from '../../config/hero-motion'
import type { HeroAnimationState, HeroConsumer, HeroLifecycle } from '../contracts/hero-runtime'

interface CreateHeroTimelineOptions {
  root: HTMLElement
  state: HeroAnimationState
  consumers: readonly HeroConsumer[]
}

export function createHeroTimeline({ root, state, consumers }: CreateHeroTimelineOptions): HeroLifecycle {
  gsap.registerPlugin(ScrollTrigger)
  const playhead = { progress: 0 }
  const timeline = gsap.timeline({
    paused: true,
    onUpdate: () => {
      const snapshot = state.setProgress(playhead.progress)
      consumers.forEach((consumer) => consumer.project(snapshot))
    }
  })
  const trigger = ScrollTrigger.create({
    trigger: root,
    start: heroMotion.scroll.start,
    end: heroMotion.scroll.end,
    animation: timeline.to(playhead, { progress: 1, duration: heroMotion.duration, ease: 'none' }),
    scrub: true
  })

  return {
    destroy: () => {
      trigger.kill()
      timeline.kill()
    }
  }
}
