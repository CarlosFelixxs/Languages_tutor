import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStats, getDecks } from '../api'
import { useSessionStore } from '../store'
import type { StatsOverview, Deck } from '../types'

export default function HomePage() {
  const { language, setLanguage } = useSessionStore()
  const [stats, setStats] = useState<StatsOverview | null>(null)
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getStats(language), getDecks(language)])
      .then(([s, d]) => { setStats(s); setDecks(d) })
      .finally(() => setLoading(false))
  }, [language])

  const langConfig = {
    spanish: { label: 'Espanhol 🇪🇸', flag: '🇪🇸', color: 'bg-red-50 border-red-200' },
    russian: { label: 'Russo 🇷🇺', flag: '🇷🇺', color: 'bg-blue-50 border-blue-200' },
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-indigo-600 text-white px-4 pt-12 pb-8">
        <h1 className="text-2xl font-bold mb-1">Language Tutor</h1>
        <p className="text-indigo-200 text-sm">Bom estudo! 🎯</p>

        {/* Streak */}
        {stats && (
          <div className="mt-4 flex items-center gap-3">
            <div className="bg-indigo-500 rounded-2xl px-4 py-2 flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <div>
                <div className="font-bold text-lg leading-none">{stats.streak}</div>
                <div className="text-indigo-200 text-xs">dias seguidos</div>
              </div>
            </div>
            <div className="bg-indigo-500 rounded-2xl px-4 py-2">
              <div className="font-bold text-lg leading-none">{stats.reviewed_today}</div>
              <div className="text-indigo-200 text-xs">revisados hoje</div>
            </div>
            <div className="bg-indigo-500 rounded-2xl px-4 py-2">
              <div className="font-bold text-lg leading-none text-yellow-300">{stats.due_today}</div>
              <div className="text-indigo-200 text-xs">pendentes</div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Language selector */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Idioma</h2>
          <div className="grid grid-cols-2 gap-3">
            {(['spanish', 'russian'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`py-3 px-4 rounded-xl border-2 text-left transition-all
                  ${language === lang
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                    : 'border-gray-200 bg-white text-gray-700'
                  }`}
              >
                <span className="text-2xl block mb-1">{langConfig[lang].flag}</span>
                <span className="text-sm">{lang === 'spanish' ? 'Espanhol' : 'Russo'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/study"
              className="bg-indigo-600 text-white rounded-xl p-4 flex flex-col items-center gap-2
                active:scale-95 transition-transform shadow-sm"
            >
              <span className="text-3xl">📚</span>
              <span className="text-sm font-medium">Estudar Agora</span>
              {stats && stats.due_today > 0 && (
                <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-bold">
                  {stats.due_today} pendentes
                </span>
              )}
            </Link>
            <Link
              to="/chat"
              className="bg-emerald-600 text-white rounded-xl p-4 flex flex-col items-center gap-2
                active:scale-95 transition-transform shadow-sm"
            >
              <span className="text-3xl">💬</span>
              <span className="text-sm font-medium">Conversar com IA</span>
            </Link>
          </div>
        </div>

        {/* Decks */}
        {decks.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Seus Baralhos</h2>
            <div className="space-y-3">
              {decks.map((deck) => (
                <Link
                  key={deck.id}
                  to={`/study?deck=${deck.id}`}
                  className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm
                    active:scale-[0.98] transition-transform"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{deck.name}</p>
                    <p className="text-sm text-gray-500">{deck.card_count} cartas</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-indigo-600">{deck.due_count}</span>
                    <p className="text-xs text-gray-400">pendentes</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Lessons shortcut */}
        <Link
          to="/lessons"
          className="block bg-amber-50 border border-amber-200 rounded-xl p-4
            active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">📖</span>
            <div>
              <p className="font-semibold text-amber-900">Ver Lições</p>
              <p className="text-sm text-amber-700">Gramática, falsos cognatos, alfabeto...</p>
            </div>
          </div>
        </Link>

        {loading && (
          <div className="text-center text-gray-400 py-8">Carregando...</div>
        )}
      </div>
    </div>
  )
}
