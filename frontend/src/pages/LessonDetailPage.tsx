import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLesson } from '../api'
import type { LessonDetail, LessonSection, WarningItem, AlphabetLetter, GrammarRow } from '../types'

export default function LessonDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState<LessonDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) getLesson(slug).then(setLesson).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Carregando...</div>
  if (!lesson) return <div className="min-h-screen flex items-center justify-center text-gray-400">Lição não encontrada.</div>

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="text-indigo-600 text-sm mb-2">
          ← Voltar
        </button>
        <h1 className="text-xl font-bold text-gray-900 leading-snug">{lesson.title}</h1>
      </div>

      <div className="px-4 py-6 space-y-6">
        {lesson.content.sections.map((section, i) => (
          <SectionRenderer key={i} section={section} />
        ))}
      </div>
    </div>
  )
}

function SectionRenderer({ section }: { section: LessonSection }) {
  switch (section.type) {
    case 'intro':
    case 'tip':
      return (
        <div className={`rounded-xl p-4 ${section.type === 'tip' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
          {section.type === 'tip' && <p className="text-blue-500 font-semibold text-sm mb-1">💡 Dica</p>}
          <p className="text-gray-700 leading-relaxed">{section.text}</p>
        </div>
      )

    case 'warning':
      return (
        <div>
          <h3 className="font-bold text-gray-900 mb-3">{section.title}</h3>
          <div className="space-y-3">
            {section.items.map((item: WarningItem, i) => (
              <div key={i} className="bg-red-50 border border-red-200 rounded-xl p-4">
                {item.pt && item.es && (
                  <>
                    <div className="flex gap-2 mb-1">
                      <span className="text-gray-600 text-sm">🇧🇷 {item.pt}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-700 font-semibold text-sm">🇪🇸 {item.es}</span>
                    </div>
                    {item.trap && <p className="text-red-600 text-xs mt-1">⚠️ {item.trap}</p>}
                  </>
                )}
                {item.cyrillic && (
                  <>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl font-bold text-indigo-700">{item.cyrillic}</span>
                      {item.looks_like && <span className="text-gray-400 text-sm">{item.looks_like}</span>}
                      <span className="text-gray-400">→</span>
                      <span className="text-green-700 font-semibold">{item.actually_is}</span>
                    </div>
                    {item.example && <p className="text-gray-600 text-xs italic">{item.example}</p>}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )

    case 'alphabet_grid':
      return (
        <div>
          <h3 className="font-bold text-gray-900 mb-3">{section.title}</h3>
          <div className="grid grid-cols-1 gap-3">
            {section.letters.map((letter: AlphabetLetter, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
                <div className="text-3xl font-bold text-indigo-700 w-16 text-center">{letter.cyrillic}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{letter.sound}</p>
                  <p className="text-xs text-gray-500">{letter.example_pt}</p>
                  <p className="text-xs text-indigo-500 italic mt-0.5">{letter.example_ru}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    case 'grammar_table':
      return (
        <div>
          <h3 className="font-bold text-gray-900 mb-3">{section.title}</h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {section.rows.map((row: GrammarRow, i) => (
              <div key={i} className={`p-4 ${i < section.rows.length - 1 ? 'border-b border-gray-100' : ''}`}>
                {Object.entries(row).map(([k, v]) => (
                  <div key={k} className="text-sm">
                    <span className="text-gray-400 text-xs uppercase">{k.replace(/_/g, ' ')}: </span>
                    <span className="text-gray-900">{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )

    default:
      return null
  }
}
