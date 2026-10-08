import { cn } from '@/_utils/cn'

interface ArrowIconProps extends Omit<React.SVGProps<SVGSVGElement>, 'viewBox' | 'width' | 'height'> {
  size?: number
}
export function ArrowIcon({ size = 24, className, ...props }: ArrowIconProps) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <path d="M5 12l14 0" />
      <path d="M13 18l6 -6" />
      <path d="M13 6l6 6" />
    </svg>
  )
}
