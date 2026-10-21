'use client'

import type { ReactNode } from 'react'
import { observeNewsMedia } from '../_utils/observeNewsMedia'
import { observeOpeningNewsMedia } from '../_utils/observeOpeningNewsMedia'

export function NewsMedia({ children, className }: { children: ReactNode; className: string }) {
  return (
    <div ref={observeNewsMedia} className={className} data-news-run-content>
      {children}
    </div>
  )
}

export function NewsSegmentFrame({
  id,
  hasContent,
  hasOpening,
  className,
  children
}: {
  id: string
  hasContent: boolean
  hasOpening: boolean
  className: string
  children: ReactNode
}) {
  return (
    <div
      ref={hasOpening ? observeOpeningNewsMedia : undefined}
      data-news-segment={id}
      data-has-content={hasContent}
      data-has-opening={hasOpening}
      className={className}
    >
      {children}
    </div>
  )
}
