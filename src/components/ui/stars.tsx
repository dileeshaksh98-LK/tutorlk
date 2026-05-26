export function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="text-amber-500 text-sm tracking-wide">
      {Array.from({ length: max }, (_, i) => (
        <span key={i}>{i < Math.round(rating) ? '★' : '☆'}</span>
      ))}
    </span>
  )
}
