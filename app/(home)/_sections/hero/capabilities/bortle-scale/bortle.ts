import { gsap } from 'gsap'
import type { HeroCapability } from '../../core/contracts'
import type { BortleClass } from '@/_features/bortle'
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

  const nodeViews = nodes.map((node) => {
    const dot = node.querySelector<HTMLElement>('[data-hero-bortle-dot]')
    return {
      node,
      dot,
      label: node.lastElementChild,
      setOpacity: gsap.quickSetter(node, 'opacity'),
      setDotScale: dot ? gsap.quickSetter(dot, 'scale') : undefined
    }
  })
  const setBaseOpacities = baseConnectors.map((connector) => gsap.quickSetter(connector, 'opacity'))
  const connectorViews = connectors.map((connector) => ({
    setScale: gsap.quickSetter(connector, 'scaleX'),
    setOpacity: gsap.quickSetter(connector, 'opacity')
  }))
  gsap.set(track, { force3D: true })
  const setTrackX = gsap.quickSetter(track, 'x', 'px')
  let previousCurrentIndex = -1
  let previousVisualIndex = -1
  let previousVisualPosition = -1
  let previousTravelProgress = -1
  let previousArrivalProgress = -1

  const render = (progress: number): void => {
    const localProgress = clamp(progress / config.endProgress, 0, 1)
    const scaledProgress = localProgress * SEGMENT_COUNT
    const currentIndex = Math.min(Math.floor(scaledProgress), classes.length - 1)
    const segmentProgress = currentIndex === classes.length - 1 ? 0 : scaledProgress - currentIndex
    const travelProgress = clamp((segmentProgress - HOLD_END) / (TRAVEL_END - HOLD_END), 0, 1)
    const arrivalProgress = clamp((segmentProgress - TRAVEL_END) / (1 - TRAVEL_END), 0, 1)
    if (
      currentIndex === previousCurrentIndex &&
      travelProgress === previousTravelProgress &&
      arrivalProgress === previousArrivalProgress
    )
      return

    const visualIndex = arrivalProgress > 0 ? currentIndex + 1 : currentIndex
    const visualPosition = currentIndex + arrivalProgress
    const currentChanged = currentIndex !== previousCurrentIndex
    const visualChanged = visualIndex !== previousVisualIndex

    // Panel state and colors change at boundaries, not on every scroll update.
    if (currentChanged) {
      panels.forEach((panel, index) => {
        const active = index === currentIndex
        panel.hidden = !active
        if (active) panel.setAttribute('aria-current', 'true')
        else panel.removeAttribute('aria-current')
      })
      connectorViews.forEach((connector, index) => {
        if (index === currentIndex && currentIndex < classes.length - 1) return
        connector.setScale(0)
        connector.setOpacity(0)
      })
    }

    if (visualChanged) {
      nodeViews.forEach(({ node, dot, label, setDotScale }, index) => {
        const active = index === visualIndex
        node.toggleAttribute('data-active', active)
        if (dot) {
          gsap.set(dot, { backgroundColor: active ? '#f4bd63' : '#616268' })
          if (!active) {
            setDotScale?.(0.56)
            dot.style.boxShadow = 'none'
          }
        }
        if (label) gsap.set(label, { color: active ? '#f4bd63' : '#87888d' })
      })
    }

    if (visualPosition !== previousVisualPosition) {
      nodeViews.forEach(({ setOpacity }, index) => {
        setOpacity(opacityAtDistance(Math.abs(index - visualPosition)))
      })
      setBaseOpacities.forEach((setOpacity, index) => {
        const distance = Math.min(Math.abs(index - visualPosition), Math.abs(index + 1 - visualPosition))
        setOpacity(opacityAtDistance(distance) * 0.55)
      })
      setTrackX(config.visual.focusX - visualPosition * config.visual.nodeSpacing)
    }

    if (visualChanged || arrivalProgress !== previousArrivalProgress) {
      const activeNode = nodeViews[visualIndex]
      if (activeNode?.dot) {
        const strength = arrivalProgress > 0 ? arrivalProgress : 1
        activeNode.setDotScale?.(gsap.utils.interpolate(0.56, 1, strength))
        activeNode.dot.style.boxShadow = `0 0 ${gsap.utils.interpolate(2, 7, strength)}px #f4bd63, 0 0 22px rgba(244, 189, 99, ${0.55 * strength})`
      }
    }

    if (currentChanged || travelProgress !== previousTravelProgress) {
      const connector = currentIndex < classes.length - 1 ? connectorViews[currentIndex] : undefined
      connector?.setScale(travelProgress)
      connector?.setOpacity(travelProgress > 0 ? 1 : 0)
    }

    previousCurrentIndex = currentIndex
    previousVisualIndex = visualIndex
    previousVisualPosition = visualPosition
    previousTravelProgress = travelProgress
    previousArrivalProgress = arrivalProgress
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
