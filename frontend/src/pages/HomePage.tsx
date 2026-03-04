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

  return (
    <div className="min-h-dvh pb-28 px-4 pt-14">
      {/* Header */}
      <div className="mb-8">
        <p className="text-white/45 text-xs uppercase tracking-[0.2em] mb-1">Language Tutor</p>
        <h1 className="text-3xl font-bold text-white">Bom estudo! 🎯</h1>
      </div>

      {/* Streak bar */}
      {stats && (
        <div className="glass flex items-center justify-between px-5 py-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <p className="text-white text-xl font-bold leading-none">{stats.streak}</p>
              <p className="text-white/45 text-xs mt-0.5">dias seguidos</p>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <p className="text-white text-lg font-bold leading-none">{stats.reviewed_today}</p>
            <p className="text-white/45 text-xs mt-0.5">hoje</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <p className="text-amber-300 text-lg font-bold leading-none">{stats.due_today}</p>
            <p className="text-white/45 text-xs mt-0.5">pendentes</p>
          </div>
        </div>
      )}

      {/* Language selector */}
      <p className="text-white/35 text-[10px] uppercase tracking-[0.2em] mb-3">Idioma</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {(['spanish', 'russian'] as const).map((lang) => {
          const active = language === lang
          const flag = lang === 'spanish' ? '🇪🇸' : '🇷🇺'
          const name = lang === 'spanish' ? 'Espanhol' : 'Russo'
          return (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`glass py-4 px-4 text-left transition-all duration-200 active:scale-95
                ${active ? 'glass-purple' : ''}`}
            >
              <span className="text-3xl block mb-2">{flag}</span>
              <p className={`text-sm font-semibold ${active ? 'text-white' : 'text-white/60'}`}>{name}</p>
            </button>
          )
        })}
      </div>

      {/* Quick actions */}
      <p className="text-white/35 text-[10px] uppercase tracking-[0.2em] mb-3">Ações Rápidas</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link
          to="/study"
          className="glass glass-purple flex flex-col items-center py-6 gap-2 active:scale-95 transition-all"
        >
          <span className="text-4xl">📚</span>
          <span className="text-white text-sm font-semibold">Estudar</span>
          {stats && stats.due_today > 0 && (
            <span className="glass-sm text-amber-300 text-[10px] px-2 py-0.5 font-bold">
              {stats.due_today} pendentes
            </span>
          )}
        </Link>
        <Link
          to="/chat"
          className="glass glass-emerald flex flex-col items-center py-6 gap-2 active:scale-95 transition-all"
        >
          <span className="text-4xl">💬</span>
          <span className="text-white text-sm font-semibold">Conversar com IA</span>
        </Link>
      </div>

      {/* Decks */}
      {!loading && decks.length > 0 && (
        <>
          <p className="text-white/35 text-[10px] uppercase tracking-[0.2em] mb-3">Baralhos</p>
          <div className="space-y-3 mb-6">
            {decks.map((deck) => (
              <Link
                key={deck.id}
                to={`/study?deck=${deck.id}`}
                className="glass flex items-center justify-between px-5 py-4 active:scale-[0.98] transition-all"
              >
                <div>
                  <p className="text-white font-semibold">{deck.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{deck.card_count} cartas</p>
                </div>
                <div className="text-right">
                  <p className="text-amber-300 text-2xl font-bold leading-none">{deck.due_count}</p>
                  <p className="text-white/35 text-[10px] mt-0.5">pendentes</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Lessons shortcut */}
      <Link
        to="/lessons"
        className="glass flex items-center gap-4 px-5 py-4 active:scale-[0.98] transition-all"
        style={{ background: 'rgba(251,191,36,0.10)', borderColor: 'rgba(251,191,36,0.20)' }}
      >
        <span className="text-3xl">📖</span>
        <div>
          <p className="text-amber-200 font-semibold">Ver Lições</p>
          <p className="text-amber-200/55 text-xs mt-0.5">Gramática, falsos cognatos, alfabeto...</p>
        </div>
        <span className="ml-auto text-white/30 text-lg">›</span>
      </Link>
    </div>
  )
}
