import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-brand to-brand-secondary text-white shadow-sm hover:opacity-90 hover:shadow-glow active:scale-[0.98]',
        secondary:
          'bg-bg-elevated text-text-primary border border-bg-border hover:bg-bg-border active:scale-[0.98]',
        ghost:
          'text-text-secondary hover:bg-bg-elevated hover:text-text-primary active:scale-[0.98]',
        outline:
          'border border-bg-border bg-transparent text-text-primary hover:bg-bg-elevated active:scale-[0.98]',
        destructive:
          'bg-error text-white hover:opacity-90 active:scale-[0.98]',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-9 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
