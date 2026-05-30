import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'
const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn('w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed', className)} {...props} />
  )
)
Input.displayName = 'Input'
export { Input }
