import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLessons } from '../api'
import { useSessionStore } from '../store'
import type { Lesson } from '../types'

const LESSON_ICONS: Record<string, string> = {
  alphabet: '🔤',
  grammar: '📐',
  vocabulary: '📝',
  pronunciation: '🔊',
}

export default function LessonsPage() {
  const { language } = useSessionStore()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLessons(language).then(setLessons).finally(() => setLoading(false))
  }, [language])

  const langLabel = language === 'spanish' ? 'Espanhol 🇪🇸' : 'Russo 🇷🇺'

  return (
    <div className="min-h-dvh pb-28 px-4 pt-14">
      <p className="text-white/35 text-[10px] uppercase tracking-[0.2em] mb-1">Aprender</p>
      <h1 className="text-3xl font-bold text-white mb-1">Lições</h1>
      <p className="text-white/45 text-sm mb-8">{langLabel}</p>

      {loading && <div className="text-white/30 text-center py-8">Carregando...</div>}

      <div className="space-y-3">
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            to={`/lessons/${lesson.slug}`}
            className="glass flex items-center gap-4 px-5 py-4 active:scale-[0.98] transition-all"
          >
            <span className="text-2xl">{LESSON_ICONS[lesson.lesson_type] || '📖'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold leading-snug">{lesson.title}</p>
              <p className="text-white/35 text-[11px] mt-0.5 capitalize">{lesson.lesson_type}</p>
            </div>
            <span className="text-white/25 text-lg flex-shrink-0">›</span>
          </Link>
        ))}
      </div>

      {!loading && lessons.length === 0 && (
        <div className="text-white/30 text-center py-8">Nenhuma lição disponível.</div>
      )}
    </div>
  )
}
