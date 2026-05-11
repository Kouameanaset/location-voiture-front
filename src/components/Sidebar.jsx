import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const links = [
    { to: '/',             label: 'Tableau de bord' },
    { to: '/clients',      label: 'Clients' },
    { to: '/voitures',     label: 'Voitures'},
    { to: '/reservations', label: 'Réservations' },
    { to: '/paiements',    label: 'Paiements'},
    { to: '/categories',   label: 'Catégories' },
]

/**
 * Composant NavLinks. Génère automatiquement les liens du menu
 * @param onClose
 * @returns {JSX.Element}
 * @constructor
 */
function NavLinks({ onClose }) {
    return (
        <>
            {links.map(({ to, label}) => (
                <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive
                                ? 'bg-gray-900 text-white font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                    }
                >
                    {label}
                </NavLink>
            ))}
        </>
    )
}

/**
 * Composant principal Sidebar
 * @returns {JSX.Element}
 * @constructor
 */
export default function Sidebar() {
    const [open, setOpen] = useState(false)

    return (
        <>
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3">
                <span className="text-base font-semibold text-gray-900">🚘 AutoLoc</span>
                <button
                    onClick={() => setOpen(!open)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600"
                >
                    {open ? '✕' : '☰'}
                </button>
            </div>

            {open && (
                <div className="md:hidden fixed top-12 left-0 right-0 z-30 bg-white border-b border-gray-100 px-3 py-3 flex flex-col gap-1 shadow-lg">
                    <NavLinks onClose={() => setOpen(false)} />
                </div>
            )}

            {open && (
                <div
                    className="md:hidden fixed inset-0 z-20 bg-black/20"
                    onClick={() => setOpen(false)}
                />
            )}

            <aside className="hidden md:flex w-56 shrink-0 h-screen sticky top-0 bg-white border-r border-gray-100 flex-col">
                <div className="px-5 py-5 border-b border-gray-100">
                    <span className="text-base font-semibold text-gray-900">AutoLoc</span>
                </div>
                <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                    <NavLinks onClose={() => {}} />
                </nav>
                <div className="px-5 py-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400">AutoLoc</p>
                </div>
            </aside>
        </>
    )
}