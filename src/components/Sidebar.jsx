import { NavLink } from 'react-router-dom'

const links = [
    { to: '/',            label: 'Tableau de bord', icon: '▦' },
    { to: '/clients',     label: 'Clients',         icon: '👤' },
    { to: '/voitures',    label: 'Voitures',        icon: '🚗' },
    { to: '/reservations',label: 'Réservations',    icon: '📋' },
    { to: '/paiements',   label: 'Paiements',       icon: '💳' },
    { to: '/categories',  label: 'Catégories',      icon: '🏷' },
]

export default function Sidebar() {
    return (
        <aside className="w-56 shrink-0 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col">
            {/* Logo */}
            <div className="px-5 py-5 border-b border-gray-100">
                <span className="text-base font-semibold text-gray-900">🚘 AutoLoc</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                {links.map(({ to, label, icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                isActive
                                    ? 'bg-gray-900 text-white font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <span style={{ fontSize: 15 }}>{icon}</span>
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">API: localhost:8000</p>
            </div>
        </aside>
    )
}