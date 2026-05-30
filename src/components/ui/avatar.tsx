import { cn } from '@/lib/utils'
interface AvatarProps { name?: string|null; image?: string|null; size?: 'xs'|'sm'|'md'|'lg'|'xl'; className?: string }
const S: Record<string,string> = { xs:'w-6 h-6 text-xs', sm:'w-8 h-8 text-xs', md:'w-10 h-10 text-sm', lg:'w-12 h-12 text-base', xl:'w-16 h-16 text-lg' }
function getInitials(name: string) { return name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) }
export function Avatar({ name, image, size='md', className }: AvatarProps) {
  return (
    <div className={cn('rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold', S[size], className)}>
      {image ? <img src={image} alt={name??''} className="w-full h-full object-cover" onError={e=>{(e.target as HTMLImageElement).style.display='none'}} /> : <span>{getInitials(name??'?')}</span>}
    </div>
  )
}
