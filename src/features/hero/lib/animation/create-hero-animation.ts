import { gsap } from 'gsap'
import type { HeroLifecycle, NightSkyFrame } from '../contracts/hero-runtime'
import { createGsapBortlePresenter } from '../bortle/create-gsap-bortle-presenter'
import { createGsapNightSky } from '../night-sky/create-gsap-night-sky'
import { createScenePresenter } from '../scenes/create-scene-presenter'
import { starCanvasSelector } from '../contracts/hero-dom-contracts'
import { createCanvasTicker } from './create-canvas-ticker'
import { createHeroAnimationState } from './hero-animation-state'
import { createHeroTimeline } from './create-hero-timeline'

const MOTION_QUERIES = {
  normal: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)'
} as const

function createBoundaryFrame(progress: number): NightSkyFrame {
  return Object.freeze({ progress, animationTimeMs: 0 })
}

function showReducedMotionActions(root: HTMLElement): void {
  const actions = root.querySelector<HTMLElement>('[data-hero-actions]')
  actions?.removeAttribute('hidden')
  actions?.removeAttribute('inert')
  actions?.setAttribute('aria-hidden', 'false')
}

export function createHeroAnimation(root: HTMLElement): HeroLifecycle {
  const sceneCount = root.querySelectorAll('[data-hero-scene]').length
  const state = createHeroAnimationState(sceneCount)
  const scenePresenter = createScenePresenter({ root })
  const bortlePresenter = createGsapBortlePresenter({ root })
  const consumers = [scenePresenter, bortlePresenter] as const
  const starCanvas = root.querySelector<HTMLCanvasElement>(starCanvasSelector)
  const fallbackImage = root.querySelector<HTMLImageElement>('[data-hero-sky-fallback]')
  const nightSky = starCanvas ? [createGsapNightSky({ canvas: starCanvas, fallbackImage })] : []
  const ticker = createCanvasTicker({ consumers: nightSky, getProgress: () => state.getSnapshot().progress })
  const project = (progress: number): void => {
    const snapshot = state.setProgress(progress)
    consumers.forEach((consumer) => consumer.project(snapshot))
  }
  const matchMedia = gsap.matchMedia(root)
  let destroyed = false

  matchMedia.add(MOTION_QUERIES.normal, () => {
    const timeline = createHeroTimeline({ root, state, consumers, ticker })
    return () => timeline.destroy()
  })
  matchMedia.add(MOTION_QUERIES.reduced, () => {
    project(0)
    showReducedMotionActions(root)
    ticker.stop(createBoundaryFrame(0))
  })

  return {
    destroy: () => {
      if (destroyed) return
      destroyed = true
      matchMedia.revert()
      ticker.destroy()
      nightSky.forEach((consumer) => consumer.destroy())
      consumers.forEach((consumer) => consumer.destroy())
    }
  }
}
