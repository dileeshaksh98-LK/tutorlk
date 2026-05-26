import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  name: string
  image?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' }

export function Avatar({ name, image, size = 'md', className }: AvatarProps) {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={cn('rounded-full object-cover flex-shrink-0', sizes[size], className)}
      />
    )
  }
  return (
    <div className={cn('rounded-full bg-brand-50 text-brand-600 font-medium flex items-center justify-center flex-shrink-0', sizes[size], className)}>
      {getInitials(name ?? 'U')}
    </div>
  )
}
