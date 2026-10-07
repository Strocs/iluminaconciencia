import { gsap } from 'gsap'
import type { HeroCapability } from '../../core/contracts'
import type { BortleClass } from '@/_shared/bortle'
import type { bortleConfig } from './config'

type BortleConfig = typeof bortleConfig

const SEGMENT_COUNT = 9
const HOLD_END = 0.6
const TRAVEL_END = 0.8
const INACTIVE_OPACITIES = [1, 0.7, 0.5, 0.33, 0.2] as const

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))

function opacityAtDistance(distance: number): number {
  const boundedDistance = clamp(distance, 0, INACTIVE_OPACITIES.length - 1)
  const lowerIndex = Math.floor(boundedDistance)
  const upperIndex = Math.ceil(boundedDistance)
  return gsap.utils.interpolate(
    INACTIVE_OPACITIES[lowerIndex],
    INACTIVE_OPACITIES[upperIndex],
    boundedDistance - lowerIndex
  )
}

export function createBortleCapability({
  root,
  classes,
  config
}: {
  root: HTMLElement
  classes: readonly BortleClass[]
  config: BortleConfig
}): HeroCapability {
  const component = root.querySelector<HTMLElement>('[data-hero-bortle-scale]')
  if (!component) return { onProgress: () => undefined, destroy: () => undefined }

  const panels = Array.from(component.querySelectorAll<HTMLElement>('[data-hero-bortle-panel]'))
  const nodes = Array.from(component.querySelectorAll<HTMLElement>('[data-hero-bortle-node]'))
  const connectors = Array.from(component.querySelectorAll<HTMLElement>('[data-hero-bortle-connector]'))
  const baseConnectors = Array.from(component.querySelectorAll<HTMLElement>('[data-hero-bortle-base-connector]'))
  const dots = Array.from(component.querySelectorAll<HTMLElement>('[data-hero-bortle-dot]'))
  const labels = nodes.map((node) => node.lastElementChild).filter((label): label is Element => label !== null)
  const track = component.querySelector<HTMLElement>('[data-hero-bortle-track]')

  if (!track || panels.length !== classes.length || nodes.length !== classes.length) {
    return { onProgress: () => undefined, destroy: () => undefined }
  }

  const render = (progress: number): void => {
    const localProgress = clamp(progress / config.endProgress, 0, 1)
    const scaledProgress = localProgress * SEGMENT_COUNT
    const currentIndex = Math.min(Math.floor(scaledProgress), classes.length - 1)
    const segmentProgress = currentIndex === classes.length - 1 ? 0 : scaledProgress - currentIndex
    const travelProgress = clamp((segmentProgress - HOLD_END) / (TRAVEL_END - HOLD_END), 0, 1)
    const arrivalProgress = clamp((segmentProgress - TRAVEL_END) / (1 - TRAVEL_END), 0, 1)
    const visualIndex = arrivalProgress > 0 ? currentIndex + 1 : currentIndex
    const nextIndex = Math.min(currentIndex + 1, classes.length - 1)
    const visualPosition = currentIndex + arrivalProgress
    const { focusX, nodeSpacing } = config.visual
    const offset = focusX - visualPosition * nodeSpacing

    panels.forEach((panel, index) => {
      const active = index === currentIndex
      panel.hidden = !active
      if (active) panel.setAttribute('aria-current', 'true')
      else panel.removeAttribute('aria-current')
    })

    nodes.forEach((node, index) => {
      const active = index === visualIndex
      node.toggleAttribute('data-active', active)
      gsap.set(node, { opacity: opacityAtDistance(Math.abs(index - visualPosition)) })
      const dot = node.querySelector<HTMLElement>('[data-hero-bortle-dot]')
      const label = node.lastElementChild
      if (dot) {
        const arriving = index === nextIndex && arrivalProgress > 0
        gsap.set(dot, {
          scale: active ? gsap.utils.interpolate(0.56, 1, arriving ? arrivalProgress : 1) : 0.56,
          backgroundColor: active ? '#f4bd63' : '#616268',
          boxShadow: active
            ? `0 0 ${gsap.utils.interpolate(2, 7, arriving ? arrivalProgress : 1)}px #f4bd63, 0 0 22px rgba(244, 189, 99, ${0.55 * (arriving ? arrivalProgress : 1)})`
            : 'none'
        })
      }
      if (label) gsap.set(label, { color: active ? '#f4bd63' : '#87888d' })
    })

    baseConnectors.forEach((connector, index) => {
      const distance = Math.min(Math.abs(index - visualPosition), Math.abs(index + 1 - visualPosition))
      gsap.set(connector, { opacity: opacityAtDistance(distance) * 0.55 })
    })

    connectors.forEach((connector, index) => {
      const active = index === currentIndex && currentIndex < classes.length - 1
      gsap.set(connector, {
        scaleX: active ? travelProgress : 0,
        opacity: active && travelProgress > 0 ? 1 : 0
      })
    })

    gsap.set(track, { x: offset, force3D: true })
  }

  render(0)

  return {
    onProgress: render,
    destroy: () => {
      panels.forEach((panel, index) => {
        const active = index === 0
        panel.hidden = !active
        if (active) panel.setAttribute('aria-current', 'true')
        else panel.removeAttribute('aria-current')
      })
      nodes.forEach((node, index) => node.toggleAttribute('data-active', index === 0))
      gsap.set(track, { clearProps: 'transform' })
      gsap.set(connectors, { clearProps: 'transform,opacity' })
      gsap.set(baseConnectors, { clearProps: 'opacity' })
      gsap.set(nodes, { clearProps: 'opacity' })
      gsap.set(dots, { clearProps: 'transform,backgroundColor,boxShadow' })
      gsap.set(labels, { clearProps: 'color' })
    }
  }
}
