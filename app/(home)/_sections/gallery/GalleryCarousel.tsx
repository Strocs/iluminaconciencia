'use client'

import { Button } from '@/_components/Button'
import { ArrowIcon } from '@/_components/icons/Arrow'
import { cn } from '@/_utils/cn'
import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

export interface GalleryImage {
  src: string
  alt: string
  width: number
  height: number
  caption?: string
}

const loopBuffer = 4
const autoAdvanceDelay = 3000

function slideLeft(track: HTMLUListElement, index: number) {
  const first = track.children[0]
  const slide = track.children[index]
  return slide.getBoundingClientRect().left - first.getBoundingClientRect().left
}

function move(track: HTMLUListElement, direction: number) {
  const step = slideLeft(track, 1)
  if (step <= 0) return
  track.scrollTo({ left: (Math.round(track.scrollLeft / step) + direction) * step })
}

function animatePhoto(
  modal: HTMLDialogElement,
  chrome: HTMLDivElement,
  thumbnail: HTMLImageElement,
  target: HTMLImageElement,
  from: DOMRect,
  onReturn?: () => void
) {
  const frameInModal = target.parentElement
  const to = frameInModal?.getBoundingClientRect()
  if (!frameInModal || !from.width || !from.height || !to?.width || !to.height) return

  // Use the already decoded thumbnail so the flight never waits for the larger image.
  const photo = document.createElement('img')
  photo.src = thumbnail.currentSrc || thumbnail.src
  photo.alt = ''
  photo.className = 'pointer-events-none fixed top-0 left-0 z-10 rounded-md border border-border object-cover'
  modal.append(photo)

  const frame = ({ left, top, width, height }: DOMRect) => ({
    transform: 'translate(' + left + 'px, ' + top + 'px)',
    width: width + 'px',
    height: height + 'px'
  })
  const duration = 420
  const flight = photo.animate(onReturn ? [frame(to), frame(from)] : [frame(from), frame(to)], {
    duration,
    easing: 'cubic-bezier(.22,.75,.2,1)',
    fill: 'forwards'
  })
  const hideTarget = frameInModal.animate([{ opacity: 0 }, { opacity: 0 }], { duration, fill: 'both' })
  const fade = chrome.animate(
    onReturn
      ? [{ opacity: 1 }, { opacity: 0, offset: 0.5 }, { opacity: 0 }]
      : [{ opacity: 0 }, { opacity: 0, offset: 0.5 }, { opacity: 1 }],
    { duration, fill: 'both' }
  )
  const cleanup = () => {
    photo.remove()
    hideTarget.cancel()
    fade.cancel()
  }
  flight.onfinish = () => {
    onReturn?.()
    cleanup()
  }
  flight.oncancel = cleanup
  return () => {
    flight.cancel()
    cleanup()
  }
}

export function GalleryCarousel({ images }: { images: readonly GalleryImage[] }) {
  const track = useRef<HTMLUListElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const chrome = useRef<HTMLDivElement>(null)
  const expandedImage = useRef<HTMLImageElement>(null)
  const cancelFlight = useRef<(() => void) | undefined>(undefined)
  const returning = useRef(false)
  const openingSlide = useRef(0)
  const opener = useRef<HTMLButtonElement>(null)
  const resumeAfter = useRef(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [hideThumbnail, setHideThumbnail] = useState(false)
  const active = selected === null ? undefined : images[selected]

  const buffer = images.length > loopBuffer ? loopBuffer : 0
  const slides = [...images.slice(images.length - buffer), ...images, ...images.slice(0, buffer + (buffer ? 1 : 0))]

  const attachTrack = useCallback(
    (node: HTMLUListElement | null) => {
      track.current = node
      if (node && buffer) node.scrollTo({ left: slideLeft(node, buffer), behavior: 'instant' })
    },
    [buffer]
  )

  const attachAutoAdvance = useCallback((node: HTMLDivElement | null) => {
    if (!node) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = false
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
    })
    observer.observe(node)
    const timer = window.setInterval(() => {
      if (
        visible &&
        !motion.matches &&
        !document.hidden &&
        !dialog.current?.open &&
        performance.now() >= resumeAfter.current &&
        !node.matches(':hover, :active, :has(:focus-visible)') &&
        track.current
      ) {
        move(track.current, 1)
      }
    }, autoAdvanceDelay)

    return () => {
      observer.disconnect()
      window.clearInterval(timer)
    }
  }, [])

  function deferAutoAdvance() {
    resumeAfter.current = performance.now() + autoAdvanceDelay
  }

  function normalizeLoop(node: HTMLUListElement) {
    if (!buffer) return
    const start = slideLeft(node, buffer)
    const end = slideLeft(node, buffer + images.length)
    const left = node.scrollLeft
    // Rebase only after scrolling settles, while the same photos occupy the viewport.
    if (left < start - 1) node.scrollTo({ left: left + end - start, behavior: 'instant' })
    else if (left >= end - 1) node.scrollTo({ left: left - end + start, behavior: 'instant' })
  }

  function open(slide: number, button: HTMLButtonElement) {
    const modal = dialog.current
    if (!modal || modal.open || images.length === 0) return
    const card = track.current?.children[slide]
    const thumbnail = card?.querySelector('img')
    const from = card?.getBoundingClientRect()
    opener.current = button
    openingSlide.current = slide

    flushSync(() => {
      setSelected((slide - buffer + images.length) % images.length)
    })
    modal.showModal()

    const target = expandedImage.current
    if (
      chrome.current &&
      thumbnail?.naturalWidth &&
      from &&
      target &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      cancelFlight.current = animatePhoto(modal, chrome.current, thumbnail, target, from)
      if (cancelFlight.current) setHideThumbnail(true)
    }
  }

  function stopFlight() {
    cancelFlight.current?.()
    cancelFlight.current = undefined
  }

  function close() {
    const modal = dialog.current
    if (!modal?.open || returning.current) return
    stopFlight()

    const node = track.current
    const target = expandedImage.current
    if (
      !chrome.current ||
      !node ||
      !target ||
      selected === null ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      modal.close()
      return
    }

    const original = openingSlide.current
    const samePhoto = (original - buffer + images.length) % images.length === selected
    let card = node.children[samePhoto ? original : buffer + selected]
    const viewport = node.getBoundingClientRect()
    let bounds = card.getBoundingClientRect()
    if (bounds.left < viewport.left - 1 || bounds.right > viewport.right + 1) {
      node.scrollTo({ left: slideLeft(node, buffer + selected), behavior: 'instant' })
      card = node.children[buffer + selected]
      bounds = card.getBoundingClientRect()
    }

    cancelFlight.current = animatePhoto(
      modal,
      chrome.current,
      target.complete && target.naturalWidth ? target : (card.querySelector('img') ?? target),
      target,
      bounds,
      () => {
        // Reveal the thumbnail before removing the dialog from the top layer.
        flushSync(() => setHideThumbnail(false))
        modal.close()
      }
    )
    if (cancelFlight.current) {
      returning.current = true
      setHideThumbnail(true)
    } else modal.close()
  }

  function stepDialog(direction: number) {
    if (returning.current) return
    stopFlight()
    setSelected((index) => (index === null ? null : (index + direction + images.length) % images.length))
  }

  return (
    <>
      <div
        ref={attachAutoAdvance}
        onPointerDown={deferAutoAdvance}
        onPointerUp={deferAutoAdvance}
        onWheel={deferAutoAdvance}
      >
        <ul
          ref={attachTrack}
          onScrollEnd={(event) => normalizeLoop(event.currentTarget)}
          className="grid snap-x snap-mandatory auto-cols-[85%] grid-flow-col gap-4 overflow-x-auto pb-3 motion-safe:scroll-smooth sm:auto-cols-[calc((100%-1rem)/2)] lg:auto-cols-[calc((100%-3rem)/4)]"
        >
          {slides.map(({ src, alt }, index) => (
            <li
              key={src + index}
              className="snap-start"
              aria-hidden={index < buffer || index >= buffer + images.length || undefined}
            >
              <button
                type="button"
                aria-label={'Ampliar imagen: ' + alt}
                tabIndex={index < buffer || index >= buffer + images.length ? -1 : undefined}
                aria-haspopup="dialog"
                onClick={(e) => open(index, e.currentTarget)}
                className={cn(
                  'group relative block aspect-4/3 w-full cursor-zoom-in overflow-hidden rounded-md border border-border bg-foreground/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
                  hideThumbnail && src === active?.src && 'opacity-0'
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 85vw"
                  className="object-cover motion-safe:transition-transform motion-safe:group-hover:scale-105"
                />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button
            as="btn"
            type="button"
            aria-label="Imagen anterior"
            className="min-h-11"
            onClick={() => {
              deferAutoAdvance()
              if (track.current) move(track.current, -1)
            }}
          >
            <ArrowIcon size={20} className="rotate-180" />
          </Button>
          <Button
            as="btn"
            type="button"
            aria-haspopup="dialog"
            variant="important"
            className="min-h-11"
            onClick={(e) => {
              const node = track.current
              const step = node && slideLeft(node, 1)
              open(node && step ? Math.round(node.scrollLeft / step) : buffer, e.currentTarget)
            }}
          >
            Abrir galería
          </Button>
          <Button
            as="btn"
            type="button"
            aria-label="Imagen siguiente"
            className="min-h-11"
            onClick={() => {
              deferAutoAdvance()
              if (track.current) move(track.current, 1)
            }}
          >
            <ArrowIcon size={20} />
          </Button>
        </div>
      </div>
      <dialog
        ref={dialog}
        aria-label="Galería ampliada"
        onCancel={(event) => {
          event.preventDefault()
          close()
        }}
        onClose={() => {
          deferAutoAdvance()
          returning.current = false
          stopFlight()
          setHideThumbnail(false)
          setSelected(null)
          opener.current?.focus({ preventScroll: true })
        }}
        className="m-auto h-[92dvh] max-h-none w-[min(96vw,96rem)] max-w-none overflow-visible bg-transparent backdrop:bg-transparent"
      >
        <div ref={chrome} className="relative isolate size-full">
          <div aria-hidden="true" className="fixed inset-0 -z-10 bg-black/80" />
          <div className="flex size-full flex-col overflow-y-auto rounded-xl border border-border bg-background bg-[radial-gradient(ellipse_at_50%_100%,#3b1f45_0%,#170d2f_40%,#010005_100%)] p-3 text-foreground sm:p-5">
            <div className="mb-3 flex shrink-0 justify-end">
              <Button as="btn" type="button" variant="neutral" size="sm" onClick={close}>
                Cerrar
              </Button>
            </div>
            {active && selected !== null && (
              <>
                <figure className="flex min-h-0 flex-1 flex-col">
                  <div className="@container-size mx-auto grid min-h-0 w-full max-w-352 flex-1 place-items-center">
                    <div
                      key={active.src}
                      className="relative overflow-hidden rounded-md border border-border opacity-0 data-loaded:opacity-100 motion-safe:transition-opacity motion-safe:duration-150 motion-safe:starting:opacity-0"
                      style={{
                        aspectRatio: active.width + ' / ' + active.height,
                        width: 'min(100cqw, ' + (100 * active.width) / active.height + 'cqh)'
                      }}
                    >
                      <Image
                        src={active.src}
                        alt={active.alt}
                        ref={expandedImage}
                        fill
                        loading="eager"
                        onLoad={(event) => event.currentTarget.parentElement?.setAttribute('data-loaded', '')}
                        sizes="(min-width: 1500px) 88rem, 96vw"
                        className="object-contain"
                      />
                    </div>
                  </div>
                  {active.caption && (
                    <figcaption className="mx-auto mt-3 max-h-[20dvh] max-w-prose shrink-0 overflow-y-auto text-center text-sm">
                      {active.caption}
                    </figcaption>
                  )}
                </figure>
                <div className="mt-4 flex shrink-0 flex-wrap items-center justify-between gap-2">
                  <Button as="btn" type="button" className="min-h-11" onClick={() => stepDialog(-1)}>
                    Anterior
                  </Button>
                  <span role="status" className="text-sm">
                    <span className="sr-only">{active.alt}: </span>
                    {selected + 1} / {images.length}
                  </span>
                  <Button as="btn" type="button" className="min-h-11" onClick={() => stepDialog(1)}>
                    Siguiente
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </dialog>
    </>
  )
}
