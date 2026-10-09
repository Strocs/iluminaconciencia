import type { SVGProps } from 'react'

type Props = Omit<SVGProps<SVGSVGElement>, 'aria-hidden' | 'aria-label' | 'className' | 'focusable' | 'role'> & {
  className?: string
  label?: string
  size?: number
}

export function BrandStarIcon({ className, label, size = 12, ...props }: Props) {
  return (
    <svg
      {...props}
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d="M8 0C10.8 5.2 10.8 5.2 16 8C10.8 10.8 10.8 10.8 8 16C5.2 10.8 5.2 10.8 0 8C5.2 5.2 5.2 5.2 8 0Z" />
    </svg>
  )
}
