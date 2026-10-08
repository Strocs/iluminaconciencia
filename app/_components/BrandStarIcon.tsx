import type { SVGProps } from 'react'
import { cn } from '@/_utils/cn'

type Props = Omit<SVGProps<SVGSVGElement>, 'aria-hidden' | 'aria-label' | 'className' | 'focusable' | 'role'> & {
  className?: string
  label?: string
}

export function BrandStarIcon({ className, label, ...props }: Props) {
  //TODO: El SVG Debe representar este caracter de manera más fiel: ✦
  return (
    <svg
      {...props}
      className={cn('size-2', className)}
      viewBox="0 0 8 8"
      fill="currentColor"
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d="M3.91342 0.149793C3.95192 0.083182 4.04808 0.0831818 4.08658 0.149793L5.45174 2.51172C5.46051 2.52689 5.47311 2.53949 5.48828 2.54826L7.85021 3.91342C7.91682 3.95192 7.91682 4.04808 7.85021 4.08658L5.48828 5.45174C5.47311 5.46051 5.46051 5.47311 5.45174 5.48828L4.08658 7.85021C4.04808 7.91682 3.95192 7.91682 3.91342 7.85021L2.54826 5.48828C2.53949 5.47311 2.52689 5.46051 2.51172 5.45174L0.149793 4.08658C0.083182 4.04808 0.0831818 3.95192 0.149793 3.91342L2.51172 2.54826C2.52689 2.53949 2.53949 2.52689 2.54826 2.51172L3.91342 0.149793Z" />
    </svg>
  )
}
