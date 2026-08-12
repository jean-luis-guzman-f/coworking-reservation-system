import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Users,
  Warehouse,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  {
    label: 'Panel principal',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Espacios',
    path: '/espacios',
    icon: Warehouse,
  },
  {
    label: 'Reservas',
    path: '/reservas',
    icon: CalendarDays,
  },
  {
    label: 'Pagos',
    path: '/pagos',
    icon: CreditCard,
  },
  {
    label: 'Usuarios',
    path: '/usuarios',
    icon: Users,
  },
]

export default function AppLayout() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand" aria-label="CoWorka">
          <span className="brand-white">Co</span>
          <span className="brand-teal">Worka</span>
        </div>

        <nav className="sidebar-navigation">
          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `navigation-item${isActive ? ' active' : ''}`
                }
              >
                <Icon size={22} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}