interface StarsProps { rating: number; max?: number; size?: 'sm'|'md' }
export function Stars({ rating, max=5, size='sm' }: StarsProps) {
  const r = Math.max(0, Math.min(rating ?? 0, max))
  const full=Math.floor(r), half=r%1>=0.5, empty=max-full-(half?1:0)
  return (
    <span className={`inline-flex items-center gap-0.5 ${size==='sm'?'text-sm':'text-base'}`} title={`${r.toFixed(1)}/${max}`}>
      {Array(full).fill(0).map((_,i)=><span key={`f${i}`} className="text-amber-400">★</span>)}
      {half&&<span className="text-amber-300">★</span>}
      {Array(empty).fill(0).map((_,i)=><span key={`e${i}`} className="text-gray-200">★</span>)}
    </span>
  )
}
