'use client'

import { useCallback, useId, useRef, useState, type KeyboardEvent } from 'react'
import type { MapInstrument } from '../data/types'
import { useMapMobile } from './useMapMobile'

const FOCUSABLE_SELECTOR = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'

export function useMapOverlays() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const panelRef = useRef<HTMLElement>(null)
  const drawerCloseRef = useRef<HTMLButtonElement>(null)
  const filterOpenRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const filterTitleId = useId()
  const filterPanelId = useId()
  const closeFiltersForDesktop = useCallback(() => {
    setFiltersOpen(false)
    returnFocusRef.current = null
  }, [])
  const mobile = useMapMobile(closeFiltersForDesktop)

  const drawerOpen = selectedId !== null
  const mobileOverlayOpen = mobile && (filtersOpen || drawerOpen)

  const onFiltersChanged = useCallback(
    (nextInstruments: MapInstrument[]) => {
      if (selectedId && !nextInstruments.some(({ id }) => id === selectedId)) {
        setSelectedId(null)
        returnFocusRef.current = null
      }
    },
    [selectedId]
  )

  const closeDrawer = useCallback((restoreFocus = true) => {
    setSelectedId(null)
    const focusTarget = returnFocusRef.current
    if (restoreFocus && focusTarget?.isConnected) {
      requestAnimationFrame(() => {
        if (focusTarget.isConnected) focusTarget.focus()
      })
    }
    returnFocusRef.current = null
  }, [])

  const openDrawer = useCallback(
    (instrument: MapInstrument, trigger: HTMLButtonElement) => {
      if (filtersOpen) return
      returnFocusRef.current = trigger
      setSelectedId(instrument.id)
      requestAnimationFrame(() => drawerCloseRef.current?.focus({ preventScroll: true }))
    },
    [filtersOpen]
  )

  const openFilters = useCallback(() => {
    closeDrawer(false)
    returnFocusRef.current = filterOpenRef.current
    setFiltersOpen(true)
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLButtonElement>('[data-filter-close]')?.focus())
  }, [closeDrawer])

  const closeFilters = useCallback((restoreFocus = true) => {
    setFiltersOpen(false)
    const focusTarget = returnFocusRef.current
    if (restoreFocus && focusTarget?.isConnected) {
      requestAnimationFrame(() => {
        if (focusTarget.isConnected) focusTarget.focus()
      })
    }
    returnFocusRef.current = null
  }, [])

  const handleFilterKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (!mobile || !filtersOpen) return
      if (event.key === 'Escape') {
        event.preventDefault()
        closeFilters()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = [...(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [])].filter(
        (element) => !element.inert
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable.at(-1)!
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [closeFilters, filtersOpen, mobile]
  )

  const handleDrawerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeDrawer()
        return
      }
      if (!mobile || event.key !== 'Tab') return
      const focusable = [...event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable.at(-1)!
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [closeDrawer, mobile]
  )

  return {
    selectedId,
    drawerOpen,
    filtersOpen,
    mobile,
    mobileOverlayOpen,
    panelRef,
    drawerCloseRef,
    filterOpenRef,
    filterTitleId,
    filterPanelId,
    onFiltersChanged,
    openDrawer,
    openFilters,
    closeDrawer,
    closeFilters,
    handleFilterKeyDown,
    handleDrawerKeyDown
  }
}
