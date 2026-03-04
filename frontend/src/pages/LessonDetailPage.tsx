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

  if (loading) return <div className="min-h-dvh flex items-center justify-center text-white/40">Carregando...</div>
  if (!lesson) return <div className="min-h-dvh flex items-center justify-center text-white/40">Lição não encontrada.</div>

  return (
    <div className="min-h-dvh pb-28">
      {/* Header */}
      <div className="px-4 pt-14 pb-5" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={() => navigate(-1)} className="text-white/45 text-sm mb-3 active:text-white/70">
          ← Voltar
        </button>
        <h1 className="text-xl font-bold text-white leading-snug">{lesson.title}</h1>
      </div>

      <div className="px-4 py-6 space-y-4">
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
      return (
        <div className="glass px-5 py-4">
          <p className="text-white/80 leading-relaxed text-sm">{section.text}</p>
        </div>
      )

    case 'tip':
      return (
        <div className="glass px-5 py-4" style={{ background: 'rgba(59,130,246,0.15)', borderColor: 'rgba(147,197,253,0.25)' }}>
          <p className="text-blue-300 font-semibold text-xs mb-1">💡 Dica</p>
          <p className="text-white/80 leading-relaxed text-sm">{section.text}</p>
        </div>
      )

    case 'warning':
      return (
        <div>
          <p className="text-white/50 text-xs uppercase tracking-widest mb-3">{section.title}</p>
          <div className="space-y-3">
            {section.items.map((item: WarningItem, i) => (
              <div key={i} className="glass px-4 py-4" style={{ background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(252,165,165,0.20)' }}>
                {item.pt && item.es && (
                  <>
                    <div className="flex gap-2 items-center mb-2 text-sm">
                      <span className="text-white/60">🇧🇷 {item.pt}</span>
                      <span className="text-white/25">→</span>
                      <span className="text-emerald-300 font-semibold">🇪🇸 {item.es}</span>
                    </div>
                    {item.trap && <p className="text-red-300 text-xs">⚠️ {item.trap}</p>}
                  </>
                )}
                {item.cyrillic && (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-bold text-violet-300">{item.cyrillic}</span>
                      {item.looks_like && <span className="text-white/40 text-xs">{item.looks_like}</span>}
                      <span className="text-white/25">→</span>
                      <span className="text-emerald-300 font-semibold text-sm">{item.actually_is}</span>
                    </div>
                    {item.example && <p className="text-white/50 text-xs italic">{item.example}</p>}
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
          <p className="text-white/50 text-xs uppercase tracking-widest mb-3">{section.title}</p>
          <div className="space-y-2">
            {section.letters.map((letter: AlphabetLetter, i) => (
              <div key={i} className="glass flex items-center gap-4 px-4 py-3">
                <div className="text-3xl font-bold text-violet-300 w-14 text-center flex-shrink-0">{letter.cyrillic}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{letter.sound}</p>
                  <p className="text-white/40 text-xs">{letter.example_pt}</p>
                  <p className="text-violet-300/70 text-xs italic mt-0.5">{letter.example_ru}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    case 'grammar_table':
      return (
        <div>
          <p className="text-white/50 text-xs uppercase tracking-widest mb-3">{section.title}</p>
          <div className="glass overflow-hidden">
            {section.rows.map((row: GrammarRow, i) => (
              <div key={i} className={`px-5 py-3 ${i < section.rows.length - 1 ? 'border-b border-white/8' : ''}`}>
                {Object.entries(row).map(([k, v]) => (
                  <div key={k} className="text-sm mb-0.5">
                    <span className="text-white/35 text-[10px] uppercase tracking-wide">{k.replace(/_/g, ' ')}: </span>
                    <span className="text-white/80">{v}</span>
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
