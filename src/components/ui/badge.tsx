import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'teal' | 'blue' | 'amber' | 'gray' | 'purple' | 'red'
}

export function Badge({ className, variant = 'gray', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block text-xs font-medium px-2 py-0.5 rounded-full',
        {
          'bg-brand-50 text-brand-600':         variant === 'teal',
          'bg-blue-50 text-blue-700':           variant === 'blue',
          'bg-amber-50 text-amber-700':         variant === 'amber',
          'bg-gray-100 text-gray-600':          variant === 'gray',
          'bg-purple-50 text-purple-700':       variant === 'purple',
          'bg-red-50 text-red-700':             variant === 'red',
        },
        className
      )}
      {...props}
    />
  )
}
