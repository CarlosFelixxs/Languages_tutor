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
    if (count === 0) return 'bg-gray-100'
    if (count < 5) return 'bg-indigo-200'
    if (count < 10) return 'bg-indigo-400'
    return 'bg-indigo-600'
  }

  return (
    <div className="min-h-screen pb-20 px-4 pt-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Progresso</h1>

      {loading && <div className="text-gray-400 text-center py-8">Carregando...</div>}

      {stats && (
        <div className="space-y-6">
          {/* Streak */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🔥</div>
              <div>
                <p className="text-5xl font-bold">{stats.streak}</p>
                <p className="text-indigo-200">dias seguidos</p>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-3xl font-bold text-gray-900">{reviewed_today}</p>
              <p className="text-sm text-gray-500">revisadas hoje</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-3xl font-bold text-indigo-600">{stats.due_today}</p>
              <p className="text-sm text-gray-500">pendentes</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm col-span-2">
              <p className="text-3xl font-bold text-gray-900">{stats.total_cards}</p>
              <p className="text-sm text-gray-500">cartas no total</p>
            </div>
          </div>

          {/* Heatmap */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Últimas 12 Semanas</h2>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      title={`${day}: ${heatmap[day] || 0} cartas`}
                      className={`w-5 h-5 rounded-sm ${getColor(day)}`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3 items-center">
              <span className="text-xs text-gray-400">menos</span>
              {['bg-gray-100', 'bg-indigo-200', 'bg-indigo-400', 'bg-indigo-600'].map((c, i) => (
                <div key={i} className={`w-4 h-4 rounded-sm ${c}`} />
              ))}
              <span className="text-xs text-gray-400">mais</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
