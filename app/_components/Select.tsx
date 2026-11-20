'use client'

import { useId, useRef, useState, useCallback, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '@/_utils/cn'
import { Button } from './Button'

interface SelectProps {
  id?: string
  label: string
  labelIcon?: ReactNode
  descriptionId?: string
  options: readonly { value: string; label: string }[]
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  className?: string
}

const normalize = (text: string) =>
  text
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

function positionList(trigger: HTMLElement, list: HTMLElement) {
  const { top, bottom, width, left } = trigger.getBoundingClientRect()
  const viewport = document.documentElement
  const gap = 6
  const gutter = 8
  const below = Math.max(0, viewport.clientHeight - bottom - gap - gutter)
  const above = Math.max(0, top - gap - gutter)
  const openAbove = below < 320 && above > below
  const listWidth = Math.min(viewport.clientWidth - gutter * 2, Math.max(width, 224))

  Object.assign(list.style, {
    width: listWidth + 'px',
    maxHeight: Math.min(320, openAbove ? above : below) + 'px',
    left: Math.max(gutter, Math.min(left, viewport.clientWidth - listWidth - gutter)) + 'px',
    top: openAbove ? 'auto' : bottom + gap + 'px',
    bottom: openAbove ? viewport.clientHeight - top + gap + 'px' : 'auto'
  })
}

export function Select({
  id,
  label,
  labelIcon,
  descriptionId,
  options,
  value,
  onValueChange,
  disabled,
  className
}: SelectProps) {
  const baseId = useId()
  const labelId = baseId + '-label'
  const listId = baseId + '-options'
  const triggerId = id ?? baseId + '-trigger'
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const search = useRef({ text: '', time: 0 })
  const [active, setActive] = useState<number | null>(null)
  const selected = options.findIndex((option) => option.value === value)
  const open = active !== null

  function closeList() {
    listRef.current?.hidePopover()
    setActive(null)
    search.current = { text: '', time: 0 }
  }

  function activate(index: number) {
    setActive(index)
    const list = listRef.current
    const option = list?.children.item(index) as HTMLElement | null
    if (!list || !option) return
    const offset = option.offsetTop
    if (offset < list.scrollTop) list.scrollTop = offset
    else if (offset + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = offset + option.offsetHeight - list.clientHeight
    }
  }

  function openList(index: number) {
    const trigger = triggerRef.current
    const list = listRef.current
    if (!trigger || !list || !options.length) return
    positionList(trigger, list)
    list.showPopover()
    trigger.focus({ preventScroll: true })
    activate(index)
  }

  const trackTriggerPosition = useCallback((list: HTMLUListElement | null) => {
    listRef.current = list
    const trigger = triggerRef.current
    if (!list || !trigger) return
    const reposition = (event: Event) => {
      if (event.target !== list) positionList(trigger, list)
    }
    const controller = new AbortController()
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) list.hidePopover()
    })
    observer.observe(trigger)
    window.addEventListener('resize', reposition, { signal: controller.signal })
    window.addEventListener('scroll', reposition, { capture: true, passive: true, signal: controller.signal })
    return () => {
      observer.disconnect()
      controller.abort()
    }
  }, [])

  function choose(index: number) {
    const option = options[index]
    closeList()
    if (option && option.value !== value) onValueChange(option.value)
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const { key } = event
    if (key === 'Tab') {
      if (open) closeList()
      return
    }
    if (key === 'Escape' && !open) return
    if (key === 'Escape') {
      event.stopPropagation()
      closeList()
    } else if (key === 'Enter' || key === ' ') {
      if (open) choose(active)
      else openList(Math.max(0, selected))
    } else if (key === 'ArrowDown' || key === 'ArrowUp') {
      if (!open) openList(selected >= 0 ? selected : key === 'ArrowUp' ? options.length - 1 : 0)
      else activate(Math.max(0, Math.min(options.length - 1, active + (key === 'ArrowDown' ? 1 : -1))))
    } else if (key === 'Home' || key === 'End') {
      const index = key === 'Home' ? 0 : options.length - 1
      if (open) activate(index)
      else openList(index)
    } else if (key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      const time = Date.now()
      const typed = normalize(key)
      const previous = time - search.current.time < 700 ? search.current.text : ''
      const query = previous === typed ? typed : previous + typed
      search.current = { text: query, time }
      const from = active ?? selected
      for (let i = previous && previous !== typed ? 0 : 1; i <= options.length; i++) {
        const index = (Math.max(-1, from) + i + options.length) % options.length
        if (!normalize(options[index].label).startsWith(query)) continue
        if (open) activate(index)
        else openList(index)
        break
      }
    } else return
    event.preventDefault()
  }

  return (
    <div className={cn('min-w-0 space-y-2', className)}>
      <label id={labelId} htmlFor={triggerId} className="flex items-center gap-2 text-sm text-foreground">
        {labelIcon && (
          <span aria-hidden="true" className="inline-flex shrink-0">
            {labelIcon}
          </span>
        )}
        {label}
      </label>
      <Button
        as="btn"
        size="sm"
        ref={triggerRef}
        id={triggerId}
        role="combobox"
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        aria-controls={listId}
        aria-expanded={open}
        aria-activedescendant={open ? listId + '-' + active : undefined}
        popoverTarget={listId}
        disabled={disabled || !options.length}
        onKeyDown={onKeyDown}
        onClick={(event) => {
          event.preventDefault()
          if (open) closeList()
          else openList(Math.max(0, selected))
        }}
        className="group/select min-h-9 w-full justify-between gap-2 bg-background px-3 text-left font-semibold aria-expanded:bg-primary aria-expanded:text-background"
      >
        <span className="min-w-0 truncate">{options[selected]?.label ?? '—'}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="size-4 shrink-0 transition-transform group-aria-expanded/select:rotate-180 motion-reduce:transition-none"
        >
          <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Button>
      <ul
        ref={open ? trackTriggerPosition : listRef}
        id={listId}
        role="listbox"
        aria-labelledby={labelId}
        popover="auto"
        onToggle={(event) => {
          if (event.newState === 'closed') {
            setActive(null)
            search.current = { text: '', time: 0 }
          }
        }}
        className="fixed inset-auto m-0 overflow-y-auto overscroll-contain rounded-lg border border-border bg-background p-1.5 font-body text-sm text-foreground shadow-xl shadow-black/40"
      >
        {options.map((option, index) => (
          <li
            id={listId + '-' + index}
            key={option.value}
            role="option"
            aria-selected={selected === index}
            data-active={active === index ? '' : undefined}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => choose(index)}
            className="flex min-h-9 cursor-pointer items-center justify-between gap-2 rounded-md border border-transparent px-2.5 py-1.5 hover:bg-primary/10 aria-selected:font-semibold aria-selected:text-primary data-active:border-primary/60 data-active:bg-primary/10"
          >
            <span>{option.label}</span>
            {selected === index && (
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0" fill="none" stroke="currentColor">
                <path d="m3.5 8 3 3 6-6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
