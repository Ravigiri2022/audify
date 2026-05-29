import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-brand/15 text-brand border border-brand/25',
        secondary:
          'bg-bg-elevated text-text-secondary border border-bg-border',
        success:
          'bg-success/15 text-success border border-success/25',
        warning:
          'bg-warning/15 text-warning border border-warning/25',
        destructive:
          'bg-error/15 text-error border border-error/25',
        outline:
          'border border-bg-border text-text-secondary bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
