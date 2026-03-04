import { useEffect, useState } from 'react'
import { getStats, getHeatmap } from '../api'
import { useSessionStore } from '../store'
import type { StatsOverview } from '../types'

export default function StatsPage() {
  const { language } = useSessionStore()
  const [stats, setStats] = useState<StatsOverview | null>(null)
  const [heatmap, setHeatmap] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getStats(language), getHeatmap()])
      .then(([s, h]) => { setStats(s); setHeatmap(h) })
      .finally(() => setLoading(false))
  }, [language])

  const today = new Date().toISOString().split('T')[0]
  const reviewed_today = heatmap[today] || 0

  // Generate last 12 weeks of dates
  const weeks: string[][] = []
  const d = new Date()
  d.setDate(d.getDate() - d.getDay()) // Start from Sunday
  for (let w = 11; w >= 0; w--) {
    const week: string[] = []
    for (let day = 0; day < 7; day++) {
      const date = new Date(d)
      date.setDate(d.getDate() - w * 7 + day)
      week.push(date.toISOString().split('T')[0])
    }
    weeks.push(week)
  }

  const getColor = (dateStr: string) => {
    const count = heatmap[dateStr] || 0
    if (count === 0) return 'rgba(255,255,255,0.06)'
    if (count < 5) return 'rgba(139,92,246,0.35)'
    if (count < 10) return 'rgba(139,92,246,0.65)'
    return 'rgba(139,92,246,1)'
  }

  return (
    <div className="min-h-dvh pb-28 px-4 pt-14">
      <p className="text-white/35 text-[10px] uppercase tracking-[0.2em] mb-1">Acompanhar</p>
      <h1 className="text-3xl font-bold text-white mb-8">Progresso</h1>

      {loading && <div className="text-white/30 text-center py-8">Carregando...</div>}

      {stats && (
        <div className="space-y-4">
          {/* Streak banner */}
          <div
            className="glass px-5 py-5 flex items-center gap-5"
            style={{ background: 'rgba(124,58,237,0.22)', borderColor: 'rgba(167,139,250,0.30)' }}
          >
            <div className="text-5xl">🔥</div>
            <div>
              <p className="text-5xl font-bold text-white leading-none">{stats.streak}</p>
              <p className="text-violet-300/80 text-sm mt-1">dias seguidos</p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass px-4 py-4">
              <p className="text-3xl font-bold text-white">{reviewed_today}</p>
              <p className="text-white/40 text-xs mt-1">revisadas hoje</p>
            </div>
            <div className="glass px-4 py-4">
              <p className="text-3xl font-bold text-violet-300">{stats.due_today}</p>
              <p className="text-white/40 text-xs mt-1">pendentes</p>
            </div>
            <div className="glass px-4 py-4 col-span-2">
              <p className="text-3xl font-bold text-white">{stats.total_cards}</p>
              <p className="text-white/40 text-xs mt-1">cartas no total</p>
            </div>
          </div>

          {/* Heatmap */}
          <div className="glass px-4 py-4">
            <h2 className="text-white/50 text-xs uppercase tracking-widest mb-4">Últimas 12 Semanas</h2>
            <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      title={`${day}: ${heatmap[day] || 0} cartas`}
                      className="w-5 h-5 rounded-sm flex-shrink-0"
                      style={{ background: getColor(day), border: '1px solid rgba(255,255,255,0.06)' }}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4 items-center">
              <span className="text-white/25 text-[10px]">menos</span>
              {[
                'rgba(255,255,255,0.06)',
                'rgba(139,92,246,0.35)',
                'rgba(139,92,246,0.65)',
                'rgba(139,92,246,1)',
              ].map((bg, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-sm"
                  style={{ background: bg, border: '1px solid rgba(255,255,255,0.08)' }}
                />
              ))}
              <span className="text-white/25 text-[10px]">mais</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
