import type { HeroCapability } from '../../core/contracts'
import { starBadgeTargets } from './star-badge-targets'
import { placeStarBadge, type BadgeBox } from './star-badge-layout'
import { starCatalog, starCatalogOriginalIndices } from './star-catalog'
import { mapStarCatalog } from './star-mapper'
import { computeSkyCrop } from './sky-crop'

const controlSelector = 'a[href],button,[role="button"],[role="link"],input,select,textarea,label[for]'
type PointerPosition = { x: number; y: number }
const containsPoint = (box: BadgeBox, point: PointerPosition): boolean =>
  point.x >= box.x && point.x <= box.x + box.width && point.y >= box.y && point.y <= box.y + box.height

export function createStarBadgesCapability(root: HTMLElement): HeroCapability | null {
  const layer = root.querySelector<HTMLElement>('[data-hero-star-badges]')
  const terrain = layer?.querySelector<SVGGeometryElement>('[data-star-terrain]')
  const canvas = root.querySelector<HTMLCanvasElement>('[data-hero-stars]')
  const artwork = root.querySelector<HTMLElement>('[data-hero-sky-artwork]')
  if (!layer || !terrain || !canvas || !artwork) return null

  const document = root.ownerDocument
  const entries = starBadgeTargets.flatMap(({ id, sourceIndices }) => {
    const element = layer.querySelector<HTMLElement>(`[data-hero-star-badge="${id}"]`)
    const name = element?.querySelector<HTMLElement>('[data-star-name]')
    const ring = element?.querySelector<HTMLElement>('[data-star-ring]')
    const members = sourceIndices.flatMap((sourceIndex) => {
      const record = starCatalog[starCatalogOriginalIndices.indexOf(sourceIndex)]
      return record ? [{ sourceIndex, record }] : []
    })
    return element && name && ring && members.length > 0 ? [{ element, name, ring, members }] : []
  })
  const members = entries.flatMap((entry) => entry.members)
  const mapped = mapStarCatalog(
    members.map(({ record }) => record),
    members.map(({ sourceIndex }) => sourceIndex)
  )
  let pointer: (PointerPosition & { touch?: boolean }) | null = null
  let gesture: (PointerPosition & { id: number }) | null = null
  let frame = 0
  let destroyed = false

  const hide = (): void => {
    layer.style.opacity = '0'
    entries.forEach(({ element }) => {
      element.dataset.visible = 'false'
    })
  }
  const layout = (): void => {
    frame = 0
    if (destroyed) return
    const bounds = canvas.getBoundingClientRect()
    const heroBounds = root.getBoundingClientRect()
    const { width, height } = bounds
    if (!pointer || !(width > 0 && height > 0) || heroBounds.bottom <= 0 || heroBounds.top >= window.innerHeight) {
      hide()
      return
    }
    // Outside the sticky stacking context, but aligned to the real sky canvas.
    layer.style.left = `${bounds.left}px`
    layer.style.top = `${bounds.top}px`
    layer.style.width = `${width}px`
    layer.style.height = `${height}px`
    layer.style.opacity = getComputedStyle(artwork).opacity
    const matrix = terrain.getScreenCTM()
    if (!matrix) {
      hide()
      return
    }
    const inverse = matrix.inverse()
    if (terrain.isPointInFill(new DOMPoint(pointer.x, pointer.y).matrixTransform(inverse))) {
      hide()
      return
    }
    const crop = computeSkyCrop(width / height)
    const header = document.querySelector<HTMLElement>('[data-site-header]')
    const controls = [root, ...(header ? [header] : [])].flatMap((scope) =>
      Array.from(scope.querySelectorAll<HTMLElement>(controlSelector))
        .filter(
          (element) =>
            !element.closest('[inert],[aria-hidden="true"]') && getComputedStyle(element).visibility !== 'hidden'
        )
        .map((element) => {
          const rect = element.getBoundingClientRect()
          return { x: rect.left - bounds.left, y: rect.top - bounds.top, width: rect.width, height: rect.height }
        })
        .filter((box) => box.width > 0 && box.height > 0)
    )
    const localPointer = { x: pointer.x - bounds.left, y: pointer.y - bounds.top }
    if (controls.some((box) => containsPoint(box, localPointer))) {
      hide()
      return
    }
    // Read every label size before writing styles; text and panels are not obstacles.
    let memberIndex = 0
    const points = entries.map((entry) => {
      const projected = entry.members.map((member) => {
        const index = memberIndex++
        const x = (mapped.origins[index * 2] * crop.scaleX - crop.offsetX) * width
        const y = (mapped.origins[index * 2 + 1] * crop.scaleY - crop.offsetY) * height
        const radius = mapped.stars[index * 4 + 1] + 3
        const inFrame = x >= 0 && x <= width && y >= 0 && y <= height
        const point = new DOMPoint(bounds.left + x, bounds.top + y).matrixTransform(inverse)
        const visible =
          inFrame && !terrain.isPointInFill(point) && !controls.some((box) => containsPoint(box, { x, y }))
        return { ...member, x, y, radius, visible }
      })
      const visibleMembers = projected.filter((member) => member.visible)
      const count = visibleMembers.length || 1
      const x = visibleMembers.reduce((sum, member) => sum + member.x, 0) / count
      const y = visibleMembers.reduce((sum, member) => sum + member.y, 0) / count
      const radius = Math.max(
        0,
        ...visibleMembers.map((member) => Math.hypot(member.x - x, member.y - y) + member.radius)
      )
      return {
        entry,
        x,
        y,
        radius,
        visible: visibleMembers.length > 0,
        width: entry.name.offsetWidth,
        height: entry.name.offsetHeight
      }
    })
    let selected = -1
    let nearest = Infinity
    const hitRadius = pointer.touch ? 24 : 16
    points.forEach((point, index) => {
      const distance = Math.hypot(localPointer.x - point.x, localPointer.y - point.y)
      if (point.visible && distance <= Math.max(hitRadius, point.radius + 6) && distance < nearest) {
        nearest = distance
        selected = index
      }
    })
    points.forEach((point, index) => {
      const { entry, x, y, radius } = point
      const box = index === selected ? placeStarBadge(point, point.width, point.height, bounds, controls) : null
      entry.element.dataset.visible = String(Boolean(box))
      if (!box) return
      entry.element.style.transform = `translate(${x}px, ${y}px)`
      entry.ring.style.width = `${radius * 2}px`
      entry.ring.style.height = `${radius * 2}px`
      entry.name.style.transform = `translate(${box.x - x}px, ${box.y - y}px)`
    })
  }
  const schedule = (): void => {
    if (!destroyed && frame === 0) frame = requestAnimationFrame(layout)
  }
  const clear = (): void => {
    pointer = null
    gesture = null
    schedule()
  }
  const allowedTarget = (event: PointerEvent): boolean => {
    if (!(event.target instanceof Element) || event.target.closest(controlSelector)) return false
    return root.contains(event.target) || Boolean(event.target.closest('[data-site-header]'))
  }
  const onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse') {
      if (!allowedTarget(event)) {
        if (pointer) clear()
        return
      }
      pointer = { x: event.clientX, y: event.clientY }
      schedule()
    } else if (
      gesture?.id === event.pointerId &&
      Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 10
    ) {
      clear()
    }
  }
  const onPointerDown = (event: PointerEvent): void => {
    if (!allowedTarget(event) || !event.isPrimary) {
      clear()
      return
    }
    if (event.pointerType !== 'mouse') gesture = { id: event.pointerId, x: event.clientX, y: event.clientY }
  }
  const onPointerUp = (event: PointerEvent): void => {
    if (gesture?.id !== event.pointerId) return
    const start = gesture
    gesture = null
    const isTap = Math.hypot(event.clientX - start.x, event.clientY - start.y) <= 10
    pointer = isTap && allowedTarget(event) ? { x: event.clientX, y: event.clientY, touch: true } : null
    schedule()
  }
  const onPointerOut = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse' && !event.relatedTarget) clear()
  }
  const observer = new ResizeObserver(schedule)
  observer.observe(canvas)
  entries.forEach(({ name }) => observer.observe(name))
  // Capture sees transparent overlays without cancelling any navigation or gestures.
  document.addEventListener('pointermove', onPointerMove, { passive: true, capture: true })
  document.addEventListener('pointerdown', onPointerDown, { passive: true, capture: true })
  document.addEventListener('pointerup', onPointerUp, { passive: true, capture: true })
  document.addEventListener('pointercancel', clear, { passive: true, capture: true })
  document.addEventListener('pointerout', onPointerOut, { passive: true, capture: true })
  window.addEventListener('blur', clear)
  window.addEventListener('scroll', clear, { passive: true })
  schedule()

  return {
    onProgress: schedule,
    destroy: () => {
      destroyed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('pointermove', onPointerMove, true)
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('pointerup', onPointerUp, true)
      document.removeEventListener('pointercancel', clear, true)
      document.removeEventListener('pointerout', onPointerOut, true)
      window.removeEventListener('blur', clear)
      window.removeEventListener('scroll', clear)
      hide()
      for (const property of ['left', 'top', 'width', 'height']) layer.style.removeProperty(property)
      entries.forEach(({ element, ring, name }) => {
        delete element.dataset.visible
        element.style.removeProperty('transform')
        ring.style.removeProperty('width')
        ring.style.removeProperty('height')
        name.style.removeProperty('transform')
      })
    }
  }
}
