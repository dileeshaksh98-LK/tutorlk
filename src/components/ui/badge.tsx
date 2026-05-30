import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface BadgeProps { children: ReactNode; variant?: 'default'|'success'|'warning'|'danger'|'info'|'outline'; className?: string }
const V: Record<string,string> = { default:'bg-gray-100 text-gray-700', success:'bg-green-50 text-green-700 border border-green-200', warning:'bg-amber-50 text-amber-700 border border-amber-200', danger:'bg-red-50 text-red-600 border border-red-200', info:'bg-blue-50 text-blue-700 border border-blue-200', outline:'bg-transparent border border-gray-300 text-gray-600' }
export function Badge({ children, variant='default', className }: BadgeProps) {
  return <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', V[variant], className)}>{children}</span>
}
