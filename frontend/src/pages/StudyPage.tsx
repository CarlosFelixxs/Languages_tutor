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
    try {
      await submitReview(card.id, rating, elapsed)
    } catch { /* continue even on error */ }

    if (rating >= 3) recordCorrect()
    else recordIncorrect()
    next()
    setSubmitting(false)
  }, [cards, index, next, recordCorrect, recordIncorrect, startTime, submitting])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-gray-500">Carregando cartas...</p>
        </div>
      </div>
    )
  }

  const done = index >= cards.length
  if (done) {
    const total = correct + incorrect
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 px-4">
        <div className="text-center max-w-xs">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sessão Concluída!</h2>
          <div className="bg-white rounded-2xl p-6 shadow-sm mt-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Cartas revisadas</span>
              <span className="font-bold">{total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Acertos</span>
              <span className="font-bold text-green-600">{correct}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Erros</span>
              <span className="font-bold text-red-500">{incorrect}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between">
                <span className="font-semibold">Precisão</span>
                <span className={`font-bold text-lg ${pct >= 70 ? 'text-green-600' : 'text-orange-500'}`}>{pct}%</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-6 w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold
              active:scale-95 transition-transform"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Tudo em dia!</h2>
          <p className="text-gray-500 mb-6">Nenhuma carta pendente em {language === 'spanish' ? 'Espanhol' : 'Russo'}.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white py-3 px-8 rounded-xl font-semibold"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  const card = cards[index]
  const progress = ((index) / cards.length) * 100

  return (
    <div className="flex flex-col min-h-screen pb-20 px-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 p-2 -ml-2">
          ← Sair
        </button>
        <span className="text-sm text-gray-500">{index + 1} / {cards.length}</span>
        <div className="w-16" />
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <FlashCard
          card={card}
          isFlipped={isFlipped}
          language={language}
          onClick={flip}
        />
        {!isFlipped && (
          <p className="mt-6 text-sm text-gray-400">Toque na carta para ver a resposta</p>
        )}
      </div>

      {/* Rating buttons — only after flip */}
      <div className="pb-4">
        {isFlipped ? (
          <RatingButtons onRate={handleRate} disabled={submitting} />
        ) : (
          <button
            onClick={flip}
            className="w-full max-w-sm mx-auto block bg-indigo-600 text-white py-4 rounded-xl
              font-semibold active:scale-95 transition-transform"
          >
            Revelar Resposta
          </button>
        )}
      </div>
    </div>
  )
}
