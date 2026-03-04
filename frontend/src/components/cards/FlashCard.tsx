import type { Card } from '../../types'

interface Props {
  card: Card
  isFlipped: boolean
  language: string
  onClick: () => void
}

export default function FlashCard({ card, isFlipped, language, onClick }: Props) {
  const langLabel = language === 'russian' ? 'Русский' : 'Español'
  const isNew = !card.reps || card.reps === 0

  return (
    <div
      className="w-full max-w-sm mx-auto h-72 perspective-1000 cursor-pointer select-none"
      onClick={onClick}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front — Portuguese */}
        <div
          className="absolute inset-0 glass flex flex-col items-center justify-center p-7"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Specular highlight orb */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full bg-white/20 blur-sm pointer-events-none" />

          <p className="text-glass-dim text-[10px] uppercase tracking-[0.2em] mb-4">Português 🇧🇷</p>
          <p className="text-glass text-2xl font-bold text-center leading-snug">{card.front}</p>

          {isNew && (
            <span className="mt-4 px-3 py-1 glass-sm text-white/70 text-[10px] uppercase tracking-widest">
              Novo
            </span>
          )}
          <p className="text-glass-dim text-xs mt-5">Toque para revelar</p>
        </div>

        {/* Back — Target language */}
        <div
          className="absolute inset-0 glass glass-purple flex flex-col items-center justify-center p-7"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full bg-white/15 blur-sm pointer-events-none" />

          <p className="text-white/50 text-[10px] uppercase tracking-[0.2em] mb-4">{langLabel}</p>
          <p className="text-white text-2xl font-bold text-center leading-snug">{card.back}</p>

          {card.pronunciation && (
            <p className="text-violet-300 text-sm mt-2 font-mono">[{card.pronunciation}]</p>
          )}
          {card.example_target && (
            <div className="mt-4 px-4 py-2 glass-sm w-full">
              <p className="text-white/65 text-xs italic text-center">{card.example_target}</p>
            </div>
          )}
          {card.grammar_note && (
            <div className="mt-2 px-4 py-2 glass-sm w-full" style={{ background: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.25)' }}>
              <p className="text-amber-200 text-xs text-center">{card.grammar_note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
