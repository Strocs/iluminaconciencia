'use client'

import type { ReactNode } from 'react'
import { observeNewsMedia } from '../_utils/observeNewsMedia'

export function NewsMedia({ children, className }: { children: ReactNode; className: string }) {
  return (
    <div ref={observeNewsMedia} className={className}>
      {children}
    </div>
  )
}
