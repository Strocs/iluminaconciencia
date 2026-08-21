    import type { HeroCapability } from '@features/hero/core/contracts'
    import type { BortleFilter } from '@features/map/bortle-filter'

    type Zone = 'hero' | 'map'
    type HeroBehavior = HeroCapability & { suspend(): void; resume(): void }
    type MapBehavior = {
      filter: BortleFilter
      onToggle: (selected: ReadonlySet<number>) => void
    }

    export interface BortleBarController {
      initBar(barElement: HTMLElement): void
      setHeroBehavior(heroBehavior: HeroBehavior): void
      updateHeroProgress(progress: number): void
      setMapFilter(filter: BortleFilter, onToggle: (selected: ReadonlySet<number>) => void): void
      setMapContainer(container: HTMLElement): void
      getBarElement(): HTMLElement | null
      destroy(): void
    }

    let controller: BortleBarController | null = null

    function createBortleBarController(): BortleBarController {
      let barElement: HTMLElement | null = null
      let currentZone: Zone = 'hero'
      let lastProgress = 0
      let heroBehavior: HeroBehavior | null = null
      let heroSuspended = false
      let mapBehavior: MapBehavior | null = null
      let zoneObserver: IntersectionObserver | null = null

      const showBar = (): void => {
        if (!barElement) return

        barElement.removeAttribute('data-hidden')
        barElement.removeAttribute('aria-hidden')
        barElement.classList.remove('invisible', 'opacity-0', 'pointer-events-none')
      }

      const showIndicator = (): void => {
        const indicator = barElement?.querySelector<HTMLElement>('[data-bortle-indicator]')
        if (indicator) indicator.style.visibility = ''
      }

      const hideIndicator = (): void => {
        const indicator = barElement?.querySelector<HTMLElement>('[data-bortle-indicator]')
        if (indicator) indicator.style.visibility = 'hidden'
      }

      const switchToMapZone = (): void => {
        if (heroBehavior && !heroSuspended) {
          heroBehavior.suspend()
          heroSuspended = true
        }
        hideIndicator()
        mapBehavior?.filter.resume()
        currentZone = 'map'
      }

      const switchToHeroZone = (): void => {
        mapBehavior?.filter.suspend()
        showIndicator()
        if (heroBehavior && heroSuspended) {
          heroBehavior.resume()
          heroSuspended = false
          heroBehavior.onProgress(lastProgress)
        }
        currentZone = 'hero'
        showBar()
      }

      return {
        initBar(nextBarElement) {
          barElement = nextBarElement
          currentZone = 'hero'
          lastProgress = 0
          heroSuspended = false
          showBar()
        },

        setHeroBehavior(nextHeroBehavior) {
          heroBehavior = nextHeroBehavior
        },

        updateHeroProgress(progress) {
          lastProgress = progress
          if (currentZone === 'hero' && heroBehavior && !heroSuspended) {
            heroBehavior.onProgress(progress)
          }
        },

        setMapFilter(filter, onToggle) {
          if (mapBehavior && mapBehavior.filter !== filter) {
            mapBehavior.filter.destroy()
          }

          mapBehavior = { filter, onToggle }
          if (currentZone === 'map') filter.resume()
          else filter.suspend()
        },

        setMapContainer(container) {
          // Tear down any previous observer before installing a new one.
          if (zoneObserver) {
            zoneObserver.disconnect()
            zoneObserver = null
          }

          // Zone switch is decoupled from positioning. CSS `position: sticky`
          // owns the bar position (browser compositor, zero per-frame JS).
          // This IntersectionObserver is the SOLE driver of the hero<->map
          // zone switch: it fires on intersection changes only, not on every
          // scroll frame, so it is far cheaper than the previous rAF scroll
          // listener + getBoundingClientRect-per-frame approach.
          //
          // The bar is sticky-bottom, so its visual bottom tracks the viewport
          // bottom. The zone flips to `map` the moment the map container top
          // crosses into the viewport (bar bottom touches map top), and back
          // to `hero` once the map container top drops below the viewport.
          zoneObserver = new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                // entry.isIntersecting === true means the map container top has
                // entered the viewport from below -> switch to map zone.
                // entry.isIntersecting === false means the map container has
                // left the viewport again -> switch back to hero zone.
                const targetZone: Zone = entry.isIntersecting ? 'map' : 'hero'
                if (targetZone !== currentZone) {
                  if (targetZone === 'map') switchToMapZone()
                  else switchToHeroZone()
                }
              }
            },
            {
              // The bar visual bottom lives at the viewport bottom. Observe
              // the map container against the full viewport so the switch
              // fires exactly when the map top reaches the viewport bottom
              // edge (where the bar bottom sits).
              threshold: 0,
              rootMargin: '0px'
            }
          )
          zoneObserver.observe(container)

          // Evaluate the initial zone immediately so the bar is correct even
          // before the first intersection callback fires.
          const mapTop = container.getBoundingClientRect().top
          const initialZone: Zone = mapTop <= window.innerHeight ? 'map' : 'hero'
          if (initialZone !== currentZone) {
            if (initialZone === 'map') switchToMapZone()
            else switchToHeroZone()
          }
        },

        getBarElement() {
          if (!barElement) {
            barElement = document.querySelector<HTMLElement>('[data-bortle-bar]')
            if (barElement) showBar()
          }
          return barElement
        },

        destroy() {
          if (zoneObserver) {
            zoneObserver.disconnect()
            zoneObserver = null
          }

          heroBehavior?.destroy()
          mapBehavior?.filter.destroy()
          barElement = null
          heroBehavior = null
          mapBehavior = null
          zoneObserver = null
          currentZone = 'hero'
          lastProgress = 0
          heroSuspended = false
        }
      }
    }

    export function getBortleBarController(): BortleBarController {
      if (!controller) controller = createBortleBarController()
      return controller
    }
