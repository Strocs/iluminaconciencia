import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/_utils/cn'

type LinkButtonVariantProps = VariantProps<typeof linkButtonVariants>

type CommonProps = LinkButtonVariantProps & {
  children: ReactNode
  className?: string
}
type LinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'aria-disabled' | 'className' | 'href'> & {
    as?: 'link'
    href: string
  }
type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'disabled' | 'type'> & {
    as: 'btn'
    type?: 'button' | 'submit' | 'reset'
  }
type Props = LinkProps | ButtonProps

const linkButtonVariants = tv({
  base: 'group inline-flex items-center justify-center rounded-full border font-body font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
  variants: {
    size: {
      sm: 'px-4 py-1 text-sm',
      md: 'gap-2.5 px-5 py-2'
    },
    variant: {
      default: 'border-border bg-transparent text-primary',
      important: 'border-primary bg-primary text-background'
    },
    disabled: {
      true: 'cursor-not-allowed opacity-50',
      false: ''
    }
  },
  compoundVariants: [
    {
      variant: 'default',
      disabled: false,
      class:
        'hover:border-primary hover:bg-primary hover:text-background active:scale-95 motion-reduce:active:scale-100'
    },
    {
      variant: 'important',
      disabled: false,
      class: 'hover:border-accent hover:bg-accent hover:text-foreground active:scale-95 motion-reduce:active:scale-100'
    }
  ],
  defaultVariants: {
    size: 'md',
    variant: 'default',
    disabled: false
  }
})

function arrowClass(disabled: boolean) {
  return cn(
    'size-4 shrink-0',
    !disabled &&
      'transition-transform duration-200 ease-out group-hover:-rotate-45 motion-reduce:transform-none motion-reduce:transition-none'
  )
}

export function LinkButton(props: Props) {
  const { as = 'link', children, className, disabled = false, size, variant, ...rest } = props
  const classNames = cn(linkButtonVariants({ size, variant, disabled }), className)

  if (as === 'btn') {
    const { type, ...buttonProps } = rest as Omit<ButtonProps, keyof CommonProps | 'as'>
    return (
      <button
        {...buttonProps}
        type={type === 'submit' || type === 'reset' ? type : 'button'}
        disabled={disabled}
        className={classNames}
      >
        <span>{children}</span>
      </button>
    )
  }

  const { href, type, ...anchorProps } = rest as Omit<LinkProps, keyof CommonProps | 'as'>
  return (
    <a
      {...anchorProps}
      href={disabled ? undefined : href}
      type={type}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : anchorProps.tabIndex}
      className={classNames}
    >
      <span>{children}</span>
      <svg
        className={arrowClass(disabled)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12h14" />
        <path d="m14 7 5 5-5 5" />
      </svg>
    </a>
  )
}
