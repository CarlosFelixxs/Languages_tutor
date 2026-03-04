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
      className="w-full max-w-sm mx-auto h-64 perspective-1000 cursor-pointer select-none"
      onClick={onClick}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d
          ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front — Portuguese */}
        <div
          className="absolute inset-0 bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-6"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Português</p>
          <p className="text-2xl font-bold text-gray-900 text-center leading-relaxed">{card.front}</p>
          {isNew && (
            <span className="mt-3 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">Novo</span>
          )}
          <p className="text-sm text-gray-400 mt-4">Toque para revelar</p>
        </div>

        {/* Back — Target language */}
        <div
          className="absolute inset-0 bg-indigo-50 rounded-2xl shadow-lg flex flex-col items-center justify-center p-6"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-xs text-indigo-400 mb-3 uppercase tracking-wide">{langLabel}</p>
          <p className="text-2xl font-bold text-indigo-900 text-center leading-relaxed">{card.back}</p>
          {card.pronunciation && (
            <p className="text-base text-indigo-500 mt-2">[{card.pronunciation}]</p>
          )}
          {card.example_target && (
            <div className="mt-3 px-3 py-2 bg-indigo-100 rounded-lg w-full">
              <p className="text-xs text-indigo-600 italic text-center">{card.example_target}</p>
            </div>
          )}
          {card.grammar_note && (
            <div className="mt-2 px-3 py-2 bg-amber-100 rounded-lg w-full">
              <p className="text-xs text-amber-700 text-center">{card.grammar_note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
