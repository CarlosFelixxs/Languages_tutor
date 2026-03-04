import { Link, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/', label: 'Início', icon: '🏠' },
  { to: '/study', label: 'Estudar', icon: '📚' },
  { to: '/lessons', label: 'Lições', icon: '📖' },
  { to: '/chat', label: 'Conversar', icon: '💬' },
  { to: '/stats', label: 'Progresso', icon: '📊' },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-50">
      <div className="flex justify-around">
        {NAV.map((item) => {
          const active = pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to))
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 text-xs
                ${active ? 'text-indigo-600' : 'text-gray-500'}
                active:scale-95 transition-transform`}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
