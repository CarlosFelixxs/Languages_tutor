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
    <div className="min-h-screen pb-20 px-4 pt-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Lições</h1>
      <p className="text-gray-500 text-sm mb-6">{langLabel}</p>

      {loading && <div className="text-center text-gray-400 py-8">Carregando...</div>}

      <div className="space-y-3">
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            to={`/lessons/${lesson.slug}`}
            className="block bg-white rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{LESSON_ICONS[lesson.lesson_type] || '📖'}</span>
              <div>
                <p className="font-semibold text-gray-900">{lesson.title}</p>
                <p className="text-xs text-gray-400 capitalize">{lesson.lesson_type}</p>
              </div>
              <span className="ml-auto text-gray-300">›</span>
            </div>
          </Link>
        ))}
      </div>

      {!loading && lessons.length === 0 && (
        <div className="text-center text-gray-400 py-8">Nenhuma lição disponível.</div>
      )}
    </div>
  )
}
