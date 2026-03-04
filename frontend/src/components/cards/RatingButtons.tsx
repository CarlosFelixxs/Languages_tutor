interface Props {
  onRate: (rating: 1 | 2 | 3 | 4) => void
  disabled?: boolean
}

const RATINGS: { value: 1 | 2 | 3 | 4; label: string; bg: string; emoji: string }[] = [
  { value: 1, label: 'De Novo', bg: 'bg-red-500 active:bg-red-600', emoji: '✗' },
  { value: 2, label: 'Difícil', bg: 'bg-orange-400 active:bg-orange-500', emoji: '~' },
  { value: 3, label: 'Bom', bg: 'bg-green-500 active:bg-green-600', emoji: '✓' },
  { value: 4, label: 'Fácil', bg: 'bg-blue-500 active:bg-blue-600', emoji: '★' },
]

export default function RatingButtons({ onRate, disabled }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-sm mx-auto">
      {RATINGS.map((r) => (
        <button
          key={r.value}
          onClick={() => onRate(r.value)}
          disabled={disabled}
          className={`${r.bg} text-white rounded-xl py-4 flex flex-col items-center
            active:scale-95 transition-transform touch-manipulation
            disabled:opacity-50`}
        >
          <span className="text-lg font-bold">{r.emoji}</span>
          <span className="text-xs mt-0.5">{r.label}</span>
        </button>
      ))}
    </div>
  )
}
