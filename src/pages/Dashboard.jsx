import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getReservations } from '../api/reservations'
import { getVoitures } from '../api/voitures'
import { getClients } from '../api/clients'
import { getPaiements } from '../api/paiements'
import Badge from '../components/Badge'

function StatCard({ label, value, sub, color = 'gray' }) {
    const colors = {
        gray:   'bg-gray-50',
        blue:   'bg-blue-50',
        green:  'bg-green-50',
        amber:  'bg-amber-50',
    }
    return (
        <div className={`${colors[color]} rounded-xl p-5`}>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    )
}

export default function Dashboard() {
    const [reservations, setReservations] = useState([])
    const [stats, setStats] = useState({ voituresDispo: 0, clients: 0, revenus: 0, actives: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const [resRes, voitRes, cliRes, paiRes] = await Promise.all([
                    getReservations({ per_page: 6 }),
                    getVoitures({ statut: 'disponible', per_page: 100 }),
                    getClients({ per_page: 1 }),
                    getPaiements({ statut: 'complete', per_page: 100 }),
                ])

                setReservations(resRes.data.data)

                const revenus = paiRes.data.data.reduce((sum, p) => sum + parseFloat(p.montant), 0)
                const actives = resRes.data.data.filter(r => ['confirmee', 'en_cours', 'en_attente'].includes(r.statut)).length

                setStats({
                    voituresDispo: voitRes.data.meta?.total ?? voitRes.data.data.length,
                    clients:       cliRes.data.meta?.total ?? 0,
                    revenus:       revenus.toFixed(2),
                    actives,
                })
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Tableau de bord</h1>
                <p className="text-sm text-gray-400 mt-0.5">{new Date().toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Réservations actives" value={stats.actives}        color="blue"  />
                <StatCard label="Voitures disponibles"  value={stats.voituresDispo} color="green" />
                <StatCard label="Total clients"         value={stats.clients}       color="gray"  />
                <StatCard label="Revenus (paiements)"   value={`${stats.revenus} $`} color="amber" />
            </div>

            {/* Réservations récentes */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-medium text-gray-900">Réservations récentes</h2>
                    <Link to="/reservations" className="text-xs text-gray-400 hover:text-gray-700">Voir tout →</Link>
                </div>

                {loading ? (
                    <p className="text-sm text-gray-400 py-4 text-center">Chargement...</p>
                ) : (
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-100">
                            <th className="table-th">Client</th>
                            <th className="table-th">Véhicule</th>
                            <th className="table-th">Début</th>
                            <th className="table-th">Fin</th>
                            <th className="table-th">Prix</th>
                            <th className="table-th">Statut</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reservations.map((r) => (
                            <tr key={r.id} className="table-tr">
                                <td className="table-td font-medium">
                                    {r.client?.prenom} {r.client?.nom}
                                </td>
                                <td className="table-td text-gray-500">
                                    {r.voiture?.marque} {r.voiture?.modele}
                                </td>
                                <td className="table-td text-gray-500">{r.date_debut}</td>
                                <td className="table-td text-gray-500">{r.date_fin}</td>
                                <td className="table-td font-medium">{r.prix_total} $</td>
                                <td className="table-td"><Badge statut={r.statut} /></td>
                            </tr>
                        ))}
                        {reservations.length === 0 && (
                            <tr><td colSpan={6} className="table-td text-center text-gray-400 py-6">Aucune réservation.</td></tr>
                        )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}