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
  onLeaveBack?: () => void
}

export function createScrollTimeline({
  root,
  capabilities,
  onEnter,
  onEnterBack,
  onLeave,
  onLeaveBack
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
  const syncFrameFixedState = (scroll: number, start: number): void => {
    if (scroll >= start) root.setAttribute('data-frame-fixed', 'true')
    else root.removeAttribute('data-frame-fixed')
  }
  const trigger = ScrollTrigger.create({
    trigger: root,
    start: coreConfig.scroll.start,
    end: coreConfig.scroll.end,
    animation: timeline.to(playhead, { progress: 1, duration: coreConfig.duration, ease: 'none' }, 0),
    scrub: true,
    onEnter: () => {
      root.setAttribute('data-frame-fixed', 'true')
      onEnter?.()
    },
    onEnterBack: () => {
      root.setAttribute('data-frame-fixed', 'true')
      onEnterBack?.()
    },
    onLeave: () => onLeave?.(),
    onLeaveBack: () => {
      root.removeAttribute('data-frame-fixed')
      onLeaveBack?.()
    },
    onRefresh: (self) => syncFrameFixedState(self.scroll(), self.start)
  })

  // Keep the frame synchronized when the hero is already at or beyond its start.
  syncFrameFixedState(trigger.scroll(), trigger.start)
  broadcast(trigger.progress)

  return {
    destroy: () => {
      trigger.kill()
      timeline.kill()
      root.removeAttribute('data-frame-fixed')
    }
  }
}
