import { Link, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/',        label: 'Início',    icon: '🏠' },
  { to: '/study',   label: 'Estudar',   icon: '📚' },
  { to: '/lessons', label: 'Lições',    icon: '📖' },
  { to: '/chat',    label: 'Conversar', icon: '💬' },
  { to: '/stats',   label: 'Progresso', icon: '📊' },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-5 px-4 pointer-events-none">
      <nav className="glass-pill px-2 py-2 flex gap-0.5 pointer-events-auto">
        {NAV.map((item) => {
          const active = pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to))
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`
                flex flex-col items-center px-4 py-2 rounded-full text-[10px] font-medium
                transition-all duration-200 min-w-[54px]
                ${active
                  ? 'bg-white/20 text-white'
                  : 'text-white/45 active:text-white/70'
                }
              `}
            >
              <span className="text-lg leading-tight mb-0.5">{item.icon}</span>
              <span className="tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
