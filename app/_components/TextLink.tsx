import type { ComponentPropsWithRef } from 'react'
import NextLink from 'next/link'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/_utils/cn'
import { ArrowIcon } from './icons/Arrow'

const textLinkVariants = tv({
  slots: {
    base: 'group/link inline-flex items-center justify-center rounded font-body text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
    icon: 'pointer-events-none shrink-0'
  },
  variants: {
    size: {
      sm: { base: 'gap-1.5 text-sm', icon: 'size-3.5' },
      md: { base: 'gap-2 text-base', icon: 'size-5' }
    },
    arrow: {
      true: {},
      false: {}
    },
    disabled: {
      true: { base: 'cursor-not-allowed opacity-50' },
      false: {
        base: 'hover:text-accent active:scale-95 motion-reduce:active:scale-100',
        icon: 'transition-transform duration-200 group-hover/link:-rotate-45 motion-reduce:transform-none motion-reduce:transition-none'
      }
    }
  },
  defaultVariants: {
    size: 'md',
    arrow: true,
    disabled: false
  }
})

type TextLinkProps = VariantProps<typeof textLinkVariants> &
  Omit<ComponentPropsWithRef<typeof NextLink>, 'aria-disabled' | 'className'> & {
    className?: string
  }

export function TextLink({ children, className, size, arrow = true, disabled = false, href, ...props }: TextLinkProps) {
  const { base, icon } = textLinkVariants({ size, arrow, disabled })

  return (
    <NextLink
      {...props}
      href={disabled ? '#' : href}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : props.tabIndex}
      className={cn(base(), className)}
    >
      {children}
      {arrow ? <ArrowIcon className={icon()} /> : null}
    </NextLink>
  )
}
