import { useEffect, useState, useCallback } from 'react'
import { getReservations, createReservation, updateReservation, deleteReservation } from '../api/reservations'
import { getClients } from '../api/clients'
import { getVoitures } from '../api/voitures'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'

const emptyForm = { client_id: '', voiture_id: '', date_debut: '', date_fin: '', notes: '' }

/**
 * Formulaire de création de réservation
 * @param initial
 * @param clients
 * @param voitures
 * @param onSubmit
 * @param loading
 * @param errors
 * @returns {JSX.Element}
 * @constructor
 */
function ReservationForm({ initial = emptyForm, clients, voitures, onSubmit, loading, errors }) {
    const [form, setForm] = useState(initial)
    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    const voiture = voitures.find(v => String(v.id) === String(form.voiture_id))
    const nbJours = form.date_debut && form.date_fin
        ? Math.max(0, (new Date(form.date_fin) - new Date(form.date_debut)) / 86400000)
        : 0
    const prixEstime = voiture?.categorie?.tarif_journalier && nbJours > 0
        ? (nbJours * parseFloat(voiture.categorie.tarif_journalier)).toFixed(2)
        : null

    return (
        <div className="flex flex-col gap-4">
            <div>
                <label className="label">Client *</label>
                <select className="input" value={form.client_id} onChange={set('client_id')}>
                    <option value="">Choisir un client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
                </select>
                {errors?.client_id && <p className="text-xs text-red-500 mt-1">{errors.client_id[0]}</p>}
            </div>
            <div>
                <label className="label">Voiture *</label>
                <select className="input" value={form.voiture_id} onChange={set('voiture_id')}>
                    <option value="">Choisir une voiture disponible</option>
                    {voitures.filter(v => v.statut === 'disponible').map(v => (
                        <option key={v.id} value={v.id}>
                            {v.marque} {v.modele} ({v.immatriculation}) — {v.categorie?.tarif_journalier} $/jour
                        </option>
                    ))}
                </select>
                {errors?.voiture_id && <p className="text-xs text-red-500 mt-1">{errors.voiture_id[0]}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label">Date de début *</label>
                    <input className="input" type="date" value={form.date_debut} onChange={set('date_debut')} />
                    {errors?.date_debut && <p className="text-xs text-red-500 mt-1">{errors.date_debut[0]}</p>}
                </div>
                <div>
                    <label className="label">Date de fin *</label>
                    <input className="input" type="date" value={form.date_fin} onChange={set('date_fin')} />
                    {errors?.date_fin && <p className="text-xs text-red-500 mt-1">{errors.date_fin[0]}</p>}
                </div>
            </div>

            {prixEstime && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600">
                    Aperçu : <span className="font-medium text-gray-900">{prixEstime} $</span>
                    <span className="text-gray-400 ml-1">({nbJours} jour{nbJours > 1 ? 's' : ''} × {voiture.categorie.tarif_journalier} $/jour — confirmé par le serveur)</span>
                </div>
            )}

            <div>
                <label className="label">Notes</label>
                <textarea className="input" rows={2} value={form.notes} onChange={set('notes')} placeholder="Instructions particulières..." />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <button className="btn btn-primary" onClick={() => onSubmit(form)} disabled={loading}>
                    {loading ? 'Enregistrement...' : 'Créer la réservation'}
                </button>
            </div>
        </div>
    )
}

/**
 * Formulaire de changement de statut
 * @param current
 * @param onSubmit
 * @param loading
 * @returns {JSX.Element}
 * @constructor
 */
function StatutForm({ current, onSubmit, loading }) {
    const [statut, setStatut] = useState(current)
    const options = ['en_attente', 'confirmee', 'en_cours', 'terminee', 'annulee']
    return (
        <div className="flex flex-col gap-4">
            <div>
                <label className="label">Nouveau statut</label>
                <select className="input" value={statut} onChange={e => setStatut(e.target.value)}>
                    {options.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
            </div>
            <div className="flex justify-end">
                <button className="btn btn-primary" onClick={() => onSubmit({ statut })} disabled={loading}>
                    {loading ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
            </div>
        </div>
    )
}

/**
 * Page Réservations
 * @returns {JSX.Element}
 * @constructor
 */
export default function Reservations() {
    const [reservations, setReservations] = useState([])
    const [clients, setClients]           = useState([])
    const [voitures, setVoitures]         = useState([])
    const [meta, setMeta]                 = useState(null)
    const [page, setPage]                 = useState(1)
    const [filters, setFilters]           = useState({ statut: '', date_debut: '' })
    const [loading, setLoading]           = useState(true)
    const [modal, setModal]               = useState(null) // 'create' | 'statut'
    const [selected, setSelected]         = useState(null)
    const [confirmId, setConfirmId]       = useState(null)
    const [saving, setSaving]             = useState(false)
    const [deleting, setDeleting]         = useState(false)
    const [errors, setErrors]             = useState({})
    const [apiError, setApiError]         = useState('')

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const params = { page }
            if (filters.statut)     params.statut     = filters.statut
            if (filters.date_debut) params.date_debut = filters.date_debut
            const res = await getReservations(params)
            setReservations(res.data.data)
            setMeta(res.data.meta)
        } finally { setLoading(false) }
    }, [page, filters])

    useEffect(() => { load() }, [load])

    useEffect(() => {
        getClients({ per_page: 100 }).then(r => setClients(r.data.data))
        getVoitures({ per_page: 100 }).then(r => setVoitures(r.data.data))
    }, [])

    const setFilter = (k) => (e) => { setFilters(f => ({ ...f, [k]: e.target.value })); setPage(1) }

    const handleCreate = async (form) => {
        setSaving(true); setErrors({}); setApiError('')
        try {
            await createReservation(form)
            setModal(null); load()
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors)
            else setApiError(err.response?.data?.message || 'Une erreur est survenue.')
        } finally { setSaving(false) }
    }

    const handleStatut = async (form) => {
        setSaving(true)
        try {
            await updateReservation(selected.id, form)
            setModal(null); load()
        } catch (err) {
            setApiError(err.response?.data?.message || 'Erreur.')
        } finally { setSaving(false) }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await deleteReservation(confirmId)
            setConfirmId(null); load()
        } catch (err) {
            setApiError(err.response?.data?.message || 'Impossible de supprimer.')
            setConfirmId(null)
        } finally { setDeleting(false) }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Réservations</h1>
                <button className="btn btn-primary" onClick={() => { setErrors({}); setModal('create') }}>
                    + Nouvelle réservation
                </button>
            </div>

            {apiError && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{apiError}</div>}

            <div className="card mb-4 flex flex-wrap gap-3 items-end">
                <div>
                    <label className="label">Statut</label>
                    <select className="input w-44" value={filters.statut} onChange={setFilter('statut')}>
                        <option value="">Tous les statuts</option>
                        <option value="en_attente">En attente</option>
                        <option value="confirmee">Confirmée</option>
                        <option value="en_cours">En cours</option>
                        <option value="terminee">Terminée</option>
                        <option value="annulee">Annulée</option>
                    </select>
                </div>
                <div>
                    <label className="label">À partir du</label>
                    <input className="input w-44" type="date" value={filters.date_debut} onChange={setFilter('date_debut')} />
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="table-wrapper">
                    <table className="w-full min-w-[750px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="table-th">Client</th>
                            <th className="table-th">Véhicule</th>
                            <th className="table-th">Début</th>
                            <th className="table-th">Fin</th>
                            <th className="table-th">Prix total</th>
                            <th className="table-th">Statut</th>
                            <th className="table-th">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="table-td text-center text-gray-400 py-10">Chargement...</td></tr>
                        ) : reservations.length === 0 ? (
                            <tr><td colSpan={7} className="table-td text-center text-gray-400 py-10">Aucune réservation trouvée.</td></tr>
                        ) : reservations.map((r) => (
                            <tr key={r.id} className="table-tr">
                                <td className="table-td font-medium">{r.client?.prenom} {r.client?.nom}</td>
                                <td className="table-td text-gray-500">{r.voiture?.marque} {r.voiture?.modele}</td>
                                <td className="table-td text-gray-500">{r.date_debut}</td>
                                <td className="table-td text-gray-500">{r.date_fin}</td>
                                <td className="table-td font-medium">{r.prix_total} $</td>
                                <td className="table-td"><Badge statut={r.statut} /></td>
                                <td className="table-td">
                                    <div className="flex gap-2">
                                        <button className="btn btn-secondary py-1 px-3 text-xs" onClick={() => { setSelected(r); setModal('statut') }}>
                                            Statut
                                        </button>
                                        <button className="btn btn-danger py-1 px-3 text-xs" onClick={() => setConfirmId(r.id)}>
                                            Supprimer
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <Pagination meta={meta} onPageChange={setPage} />
            </div>

            <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="Nouvelle réservation" size="lg">
                <ReservationForm clients={clients} voitures={voitures} onSubmit={handleCreate} loading={saving} errors={errors} />
            </Modal>

            <Modal isOpen={modal === 'statut'} onClose={() => setModal(null)} title="Changer le statut" size="sm">
                {selected && <StatutForm current={selected.statut} onSubmit={handleStatut} loading={saving} />}
            </Modal>

            <ConfirmDialog isOpen={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={handleDelete} loading={deleting}
                           title="Supprimer la réservation" message="Voulez-vous vraiment supprimer cette réservation ?" />
        </div>
    )
}