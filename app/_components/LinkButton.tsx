import type { ComponentPropsWithRef, ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/_utils/cn'
import { ArrowIcon } from './icons/Arrow'

type LinkButtonVariantProps = VariantProps<typeof linkButtonVariants>

type CommonProps = LinkButtonVariantProps & {
  children: ReactNode
  className?: string
}
type LinkProps = CommonProps &
  Omit<ComponentPropsWithRef<'a'>, 'aria-disabled' | 'className' | 'href'> & {
    as?: 'link'
    href: string
  }
type ButtonProps = CommonProps &
  Omit<ComponentPropsWithRef<'button'>, 'className' | 'disabled' | 'type'> & {
    as: 'btn'
    type?: 'button' | 'submit' | 'reset'
  }
type Props = LinkProps | ButtonProps

const linkButtonVariants = tv({
  base: 'group/link-button inline-flex items-center justify-center rounded border font-body transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
  variants: {
    size: {
      sm: 'gap-1.5 px-4 py-1 text-sm',
      md: 'gap-2 px-5 py-2'
    },
    variant: {
      default: 'border-primary bg-transparent text-primary',
      important: 'border-primary bg-primary text-background',
      neutral: 'border-foreground bg-transparent text-foreground',
      text: 'border-0 bg-transparent p-0 text-foreground'
    },
    disabled: {
      true: 'cursor-not-allowed opacity-50',
      false: ''
    }
  },
  compoundVariants: [
    {
      variant: 'text',
      disabled: false,
      class: 'hover:text-accent active:scale-95 motion-reduce:active:scale-100'
    },
    {
      variant: 'default',
      disabled: false,
      class: 'hover:bg-primary hover:text-background active:scale-95 motion-reduce:active:scale-100'
    },
    {
      variant: 'important',
      disabled: false,
      class: 'hover:bg-accent hover:text-foreground active:scale-95 motion-reduce:active:scale-100'
    },
    {
      variant: 'neutral',
      disabled: false,
      class: 'hover:bg-foreground hover:text-background active:scale-95 motion-reduce:active:scale-100'
    }
  ],
  defaultVariants: {
    size: 'md',
    variant: 'default',
    disabled: false
  }
})

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
        {children}
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
      {children}
      <ArrowIcon
        size={size === 'sm' ? 16 : 20}
        className={cn(
          !disabled &&
            'pointer-events-none transition-transform duration-200 group-hover/link-button:-rotate-45 motion-reduce:transform-none motion-reduce:transition-none'
        )}
      />
    </a>
  )
}
