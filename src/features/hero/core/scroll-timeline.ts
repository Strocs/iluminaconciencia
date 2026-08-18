import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { HeroCapability, HeroLifecycle } from './contracts'
import { coreConfig } from './config'

interface CreateScrollTimelineOptions {
  root: HTMLElement
  capabilities: readonly HeroCapability[]
  onEnter?: () => void
  onEnterBack?: () => void
  onLeave?: () => void
}

export function createScrollTimeline({
  root,
  capabilities,
  onEnter,
  onEnterBack,
  onLeave
}: CreateScrollTimelineOptions): HeroLifecycle {
  gsap.registerPlugin(ScrollTrigger)
  const playhead = { progress: 0 }
  const broadcast = (progress: number): void => {
    capabilities.forEach((capability) => capability.onProgress(progress))
  }
  const timeline = gsap.timeline({
    paused: true,
    onUpdate: () => broadcast(playhead.progress)
  })
  const trigger = ScrollTrigger.create({
    trigger: root,
    start: coreConfig.scroll.start,
    end: coreConfig.scroll.end,
    animation: timeline.to(playhead, { progress: 1, duration: coreConfig.duration, ease: 'none' }, 0),
    scrub: true,
    onEnter,
    onEnterBack,
    onLeave
  })

  // Set the initial state on mount. ScrollTrigger's onEnter only fires when the
  // element enters from below, not when it's already visible at load.
  broadcast(trigger.progress)

  return {
    destroy: () => {
      trigger.kill()
      timeline.kill()
    }
  }
}