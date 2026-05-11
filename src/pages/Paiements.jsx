import { useEffect, useState, useCallback } from 'react'
import { getPaiements, createPaiement } from '../api/paiements'
import { getReservations } from '../api/reservations'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'

const emptyForm = { reservation_id: '', montant: '', methode: 'carte' }

/**
 * Formulaire de paiement. Permet de sélectionner une réservation et d'enregistrer un paiement.
 * @param initial
 * @param reservations
 * @param onSubmit
 * @param loading
 * @param errors
 * @returns {JSX.Element}
 * @constructor
 */
function PaiementForm({ initial = emptyForm, reservations, onSubmit, loading, errors }) {
    const [form, setForm] = useState(initial)
    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    const handleResChange = (e) => {
        const id  = e.target.value
        const res = reservations.find(r => String(r.id) === id)
        setForm(f => ({ ...f, reservation_id: id, montant: res ? res.prix_total : '' }))
    }

    return (
        <div className="flex flex-col gap-4">
            <div>
                <label className="label">Réservation *</label>
                <select className="input" value={form.reservation_id} onChange={handleResChange}>
                    <option value="">Choisir une réservation</option>
                    {reservations.map(r => (
                        <option key={r.id} value={r.id}>
                            #{r.id} — {r.client?.prenom} {r.client?.nom} · {r.voiture?.marque} {r.voiture?.modele} · {r.prix_total} $
                        </option>
                    ))}
                </select>
                {errors?.reservation_id && <p className="text-xs text-red-500 mt-1">{errors.reservation_id[0]}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label">Montant ($) *</label>
                    <input className="input" type="number" step="0.01" value={form.montant} onChange={set('montant')} placeholder="0.00" />
                    {errors?.montant && <p className="text-xs text-red-500 mt-1">{errors.montant[0]}</p>}
                </div>
                <div>
                    <label className="label">Méthode *</label>
                    <select className="input" value={form.methode} onChange={set('methode')}>
                        <option value="carte">Carte</option>
                        <option value="comptant">Comptant</option>
                        <option value="virement">Virement</option>
                        <option value="cheque">Chèque</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <button className="btn btn-primary" onClick={() => onSubmit(form)} disabled={loading}>
                    {loading ? 'Enregistrement...' : 'Enregistrer le paiement'}
                </button>
            </div>
        </div>
    )
}

/**
 * Page Paiements
 * Affiche la liste des paiements avec filtres + pagination.
 * Permet aussi d'ajouter un nouveau paiement.
 * @returns {JSX.Element}
 * @constructor
 */
export default function Paiements() {
    const [paiements, setPaiements]     = useState([])
    const [reservations, setReservations] = useState([])
    const [meta, setMeta]               = useState(null)
    const [page, setPage]               = useState(1)
    const [filters, setFilters]         = useState({ statut: '', methode: '' })
    const [loading, setLoading]         = useState(true)
    const [modal, setModal]             = useState(false)
    const [saving, setSaving]           = useState(false)
    const [errors, setErrors]           = useState({})
    const [apiError, setApiError]       = useState('')

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const params = { page }
            if (filters.statut)  params.statut  = filters.statut
            if (filters.methode) params.methode = filters.methode
            const res = await getPaiements(params)
            setPaiements(res.data.data)
            setMeta(res.data.meta)
        } finally { setLoading(false) }
    }, [page, filters])

    useEffect(() => { load() }, [load])

    useEffect(() => {
        getReservations({ statut: 'confirmee', per_page: 100 }).then(r => setReservations(r.data.data))
    }, [])

    const setFilter = (k) => (e) => { setFilters(f => ({ ...f, [k]: e.target.value })); setPage(1) }

    const handleSave = async (form) => {
        setSaving(true); setErrors({}); setApiError('')
        try {
            await createPaiement(form)
            setModal(false); load()
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors)
            else setApiError(err.response?.data?.message || 'Une erreur est survenue.')
        } finally { setSaving(false) }
    }

    const methodeLabel = { carte: 'Carte', comptant: 'Comptant', virement: 'Virement', cheque: 'Chèque' }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Paiements</h1>
                <button className="btn btn-primary" onClick={() => { setErrors({}); setModal(true) }}>
                    + Enregistrer un paiement
                </button>
            </div>

            {apiError && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{apiError}</div>}

            <div className="card mb-4 flex flex-wrap gap-3">
                <select className="input w-44" value={filters.statut} onChange={setFilter('statut')}>
                    <option value="">Tous les statuts</option>
                    <option value="complete">Complété</option>
                    <option value="en_attente">En attente</option>
                    <option value="rembourse">Remboursé</option>
                    <option value="echoue">Échoué</option>
                </select>
                <select className="input w-44" value={filters.methode} onChange={setFilter('methode')}>
                    <option value="">Toutes les méthodes</option>
                    <option value="carte">Carte</option>
                    <option value="comptant">Comptant</option>
                    <option value="virement">Virement</option>
                    <option value="cheque">Chèque</option>
                </select>
            </div>

            <div className="card p-0 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="table-th">#</th>
                        <th className="table-th">Réservation</th>
                        <th className="table-th">Client</th>
                        <th className="table-th">Montant</th>
                        <th className="table-th">Méthode</th>
                        <th className="table-th">Date</th>
                        <th className="table-th">Statut</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr><td colSpan={7} className="table-td text-center text-gray-400 py-10">Chargement...</td></tr>
                    ) : paiements.length === 0 ? (
                        <tr><td colSpan={7} className="table-td text-center text-gray-400 py-10">Aucun paiement trouvé.</td></tr>
                    ) : paiements.map((p) => (
                        <tr key={p.id} className="table-tr">
                            <td className="table-td text-gray-400 text-xs">#{p.id}</td>
                            <td className="table-td text-gray-500">Réservation #{p.reservation?.id ?? p.reservation_id}</td>
                            <td className="table-td font-medium">
                                {p.reservation?.client?.prenom} {p.reservation?.client?.nom}
                            </td>
                            <td className="table-td font-semibold">{p.montant} $</td>
                            <td className="table-td text-gray-500">{methodeLabel[p.methode] ?? p.methode}</td>
                            <td className="table-td text-gray-500 text-xs">
                                {p.date_paiement ? new Date(p.date_paiement).toLocaleDateString('fr-CA') : '—'}
                            </td>
                            <td className="table-td"><Badge statut={p.statut} /></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <Pagination meta={meta} onPageChange={setPage} />
            </div>

            <Modal isOpen={modal} onClose={() => setModal(false)} title="Enregistrer un paiement" size="md">
                <PaiementForm reservations={reservations} onSubmit={handleSave} loading={saving} errors={errors} />
            </Modal>
        </div>
    )
}