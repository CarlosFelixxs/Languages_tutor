interface Props {
  onRate: (rating: 1 | 2 | 3 | 4) => void
  disabled?: boolean
}

const RATINGS: { value: 1 | 2 | 3 | 4; label: string; glass: string; emoji: string }[] = [
  { value: 1, label: 'De Novo', glass: 'glass-btn glass-red',    emoji: '✕' },
  { value: 2, label: 'Difícil', glass: 'glass-btn glass-orange', emoji: '~' },
  { value: 3, label: 'Bom',     glass: 'glass-btn glass-green',  emoji: '✓' },
  { value: 4, label: 'Fácil',   glass: 'glass-btn glass-blue',   emoji: '★' },
]

export default function RatingButtons({ onRate, disabled }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-sm mx-auto">
      {RATINGS.map((r) => (
        <button
          key={r.value}
          onClick={() => onRate(r.value)}
          disabled={disabled}
          className={`${r.glass} py-4 flex flex-col items-center touch-manipulation disabled:opacity-40`}
        >
          <span className="text-lg font-bold">{r.emoji}</span>
          <span className="text-[11px] mt-0.5 text-white/80">{r.label}</span>
        </button>
      ))}
    </div>
  )
}
