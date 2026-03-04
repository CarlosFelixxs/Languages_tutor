import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import FlashCard from '../components/cards/FlashCard'
import RatingButtons from '../components/cards/RatingButtons'
import { getDueCards, submitReview } from '../api'
import { useSessionStore } from '../store'

export default function StudyPage() {
  const { language, cards, index, isFlipped, flip, next, setCards, recordCorrect, recordIncorrect, correct, incorrect, startTime } = useSessionStore()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    getDueCards(language, 20)
      .then(setCards)
      .finally(() => setLoading(false))
  }, [language, setCards])

  const handleRate = useCallback(async (rating: 1 | 2 | 3 | 4) => {
    if (submitting) return
    const card = cards[index]
    if (!card) return
    setSubmitting(true)
    const elapsed = Date.now() - startTime
    try { await submitReview(card.id, rating, elapsed) } catch { /* continue */ }
    if (rating >= 3) recordCorrect()
    else recordIncorrect()
    next()
    setSubmitting(false)
  }, [cards, index, next, recordCorrect, recordIncorrect, startTime, submitting])

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-white/50">Carregando cartas...</p>
        </div>
      </div>
    )
  }

  const done = index >= cards.length && cards.length > 0
  if (done) {
    const total = correct + incorrect
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0
    return (
      <div className="min-h-dvh flex items-center justify-center pb-28 px-4">
        <div className="text-center max-w-xs w-full">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">Sessão Concluída!</h2>
          <div className="glass p-6 mt-6 space-y-4">
            {[
              { label: 'Cartas revisadas', value: total, color: 'text-white' },
              { label: 'Acertos', value: correct, color: 'text-emerald-300' },
              { label: 'Erros', value: incorrect, color: 'text-red-300' },
            ].map(r => (
              <div key={r.label} className="flex justify-between items-center">
                <span className="text-white/50 text-sm">{r.label}</span>
                <span className={`font-bold text-lg ${r.color}`}>{r.value}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
              <span className="text-white font-semibold">Precisão</span>
              <span className={`font-bold text-2xl ${pct >= 70 ? 'text-emerald-300' : 'text-orange-300'}`}>{pct}%</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="glass-btn glass-purple mt-6 w-full py-4 text-sm"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-dvh flex items-center justify-center pb-28 px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-white mb-2">Tudo em dia!</h2>
          <p className="text-white/50 mb-6 text-sm">Nenhuma carta pendente em {language === 'spanish' ? 'Espanhol' : 'Russo'}.</p>
          <button onClick={() => navigate('/')} className="glass-btn glass-purple px-8 py-3 text-sm">
            Voltar
          </button>
        </div>
      </div>
    )
  }

  const card = cards[index]
  const progress = (index / cards.length) * 100

  return (
    <div className="flex flex-col min-h-dvh pb-28 px-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="text-white/40 text-sm px-1 active:text-white/70">
          ← Sair
        </button>
        <span className="text-white/40 text-sm">{index + 1} / {cards.length}</span>
        <div className="w-12" />
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 rounded-full mb-8" style={{ background: 'rgba(255,255,255,0.10)' }}>
        <div
          className="h-1 rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, rgba(139,92,246,1), rgba(59,130,246,1))',
          }}
        />
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <FlashCard card={card} isFlipped={isFlipped} language={language} onClick={flip} />
        {!isFlipped && (
          <p className="mt-6 text-white/30 text-xs tracking-wide">Toque para revelar</p>
        )}
      </div>

      {/* Rating / Reveal */}
      <div className="pb-4">
        {isFlipped ? (
          <RatingButtons onRate={handleRate} disabled={submitting} />
        ) : (
          <button
            onClick={flip}
            className="glass-btn glass-purple w-full max-w-sm mx-auto block py-4 text-sm"
          >
            Revelar Resposta
          </button>
        )}
      </div>
    </div>
  )
}
