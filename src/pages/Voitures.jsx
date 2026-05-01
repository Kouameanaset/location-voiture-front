import { useEffect, useState, useCallback } from 'react'
import { getVoitures, createVoiture, updateVoiture, deleteVoiture } from '../api/voitures'
import { getCategories } from '../api/categories'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'

const emptyForm = { categorie_id: '', marque: '', modele: '', annee: '', immatriculation: '', couleur: '', kilometrage: '', statut: 'disponible' }

function VoitureForm({ initial = emptyForm, categories, onSubmit, loading, errors }) {
    const [form, setForm] = useState(initial)
    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    return (
        <div className="flex flex-col gap-4">
            <div>
                <label className="label">Catégorie *</label>
                <select className="input" value={form.categorie_id} onChange={set('categorie_id')}>
                    <option value="">Choisir une catégorie</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.nom} — {c.tarif_journalier} $/jour</option>)}
                </select>
                {errors?.categorie_id && <p className="text-xs text-red-500 mt-1">{errors.categorie_id[0]}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label">Marque *</label>
                    <input className="input" value={form.marque} onChange={set('marque')} placeholder="Toyota" />
                    {errors?.marque && <p className="text-xs text-red-500 mt-1">{errors.marque[0]}</p>}
                </div>
                <div>
                    <label className="label">Modèle *</label>
                    <input className="input" value={form.modele} onChange={set('modele')} placeholder="Corolla" />
                    {errors?.modele && <p className="text-xs text-red-500 mt-1">{errors.modele[0]}</p>}
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="label">Année *</label>
                    <input className="input" type="number" value={form.annee} onChange={set('annee')} placeholder="2023" />
                    {errors?.annee && <p className="text-xs text-red-500 mt-1">{errors.annee[0]}</p>}
                </div>
                <div>
                    <label className="label">Immatriculation *</label>
                    <input className="input" value={form.immatriculation} onChange={set('immatriculation')} placeholder="ABC-1234" />
                    {errors?.immatriculation && <p className="text-xs text-red-500 mt-1">{errors.immatriculation[0]}</p>}
                </div>
                <div>
                    <label className="label">Couleur</label>
                    <input className="input" value={form.couleur} onChange={set('couleur')} placeholder="Blanc" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label">Kilométrage</label>
                    <input className="input" type="number" value={form.kilometrage} onChange={set('kilometrage')} placeholder="0" />
                </div>
                <div>
                    <label className="label">Statut</label>
                    <select className="input" value={form.statut} onChange={set('statut')}>
                        <option value="disponible">Disponible</option>
                        <option value="louee">Louée</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="hors_service">Hors service</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <button className="btn btn-primary" onClick={() => onSubmit(form)} disabled={loading}>
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
            </div>
        </div>
    )
}

export default function Voitures() {
    const [voitures, setVoitures]       = useState([])
    const [categories, setCategories]   = useState([])
    const [meta, setMeta]               = useState(null)
    const [page, setPage]               = useState(1)
    const [filters, setFilters]         = useState({ statut: '', categorie_id: '', search: '' })
    const [loading, setLoading]         = useState(true)
    const [modal, setModal]             = useState(null)
    const [selected, setSelected]       = useState(null)
    const [confirmId, setConfirmId]     = useState(null)
    const [saving, setSaving]           = useState(false)
    const [deleting, setDeleting]       = useState(false)
    const [errors, setErrors]           = useState({})
    const [apiError, setApiError]       = useState('')

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const params = { page }
            if (filters.statut)       params.statut       = filters.statut
            if (filters.categorie_id) params.categorie_id = filters.categorie_id
            if (filters.search)       params.search       = filters.search
            const res = await getVoitures(params)
            setVoitures(res.data.data)
            setMeta(res.data.meta)
        } finally {
            setLoading(false)
        }
    }, [page, filters])

    useEffect(() => { load() }, [load])

    useEffect(() => {
        getCategories({ per_page: 100 }).then(r => setCategories(r.data.data))
    }, [])

    const setFilter = (k) => (e) => { setFilters(f => ({ ...f, [k]: e.target.value })); setPage(1) }

    const handleSave = async (form) => {
        setSaving(true); setErrors({}); setApiError('')
        try {
            if (modal === 'edit') await updateVoiture(selected.id, form)
            else await createVoiture(form)
            setModal(null); load()
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors)
            else setApiError(err.response?.data?.message || 'Une erreur est survenue.')
        } finally { setSaving(false) }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await deleteVoiture(confirmId)
            setConfirmId(null); load()
        } catch (err) {
            setApiError(err.response?.data?.message || 'Impossible de supprimer.')
            setConfirmId(null)
        } finally { setDeleting(false) }
    }

    const toForm = (v) => ({ ...v, categorie_id: v.categorie_id ?? v.categorie?.id ?? '' })

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Voitures</h1>
                <button className="btn btn-primary" onClick={() => { setSelected(null); setErrors({}); setModal('create') }}>
                    + Ajouter une voiture
                </button>
            </div>

            {apiError && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{apiError}</div>}

            {/* Filtres */}
            <div className="card mb-4 flex flex-wrap gap-3">
                <input className="input w-48" placeholder="Rechercher marque/modèle..." value={filters.search} onChange={setFilter('search')} />
                <select className="input w-44" value={filters.statut} onChange={setFilter('statut')}>
                    <option value="">Tous les statuts</option>
                    <option value="disponible">Disponible</option>
                    <option value="louee">Louée</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="hors_service">Hors service</option>
                </select>
                <select className="input w-48" value={filters.categorie_id} onChange={setFilter('categorie_id')}>
                    <option value="">Toutes les catégories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="card p-0 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="table-th">Véhicule</th>
                        <th className="table-th">Immatriculation</th>
                        <th className="table-th">Catégorie</th>
                        <th className="table-th">Kilométrage</th>
                        <th className="table-th">Statut</th>
                        <th className="table-th">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr><td colSpan={6} className="table-td text-center text-gray-400 py-10">Chargement...</td></tr>
                    ) : voitures.length === 0 ? (
                        <tr><td colSpan={6} className="table-td text-center text-gray-400 py-10">Aucune voiture trouvée.</td></tr>
                    ) : voitures.map((v) => (
                        <tr key={v.id} className="table-tr">
                            <td className="table-td">
                                <div className="font-medium">{v.marque} {v.modele}</div>
                                <div className="text-xs text-gray-400">{v.annee} · {v.couleur}</div>
                            </td>
                            <td className="table-td font-mono text-xs text-gray-500">{v.immatriculation}</td>
                            <td className="table-td text-gray-500">{v.categorie?.nom ?? '—'}</td>
                            <td className="table-td text-gray-500">{Number(v.kilometrage).toLocaleString()} km</td>
                            <td className="table-td"><Badge statut={v.statut} /></td>
                            <td className="table-td">
                                <div className="flex gap-2">
                                    <button className="btn btn-secondary py-1 px-3 text-xs" onClick={() => { setSelected(toForm(v)); setErrors({}); setModal('edit') }}>
                                        Modifier
                                    </button>
                                    <button className="btn btn-danger py-1 px-3 text-xs" onClick={() => setConfirmId(v.id)}>
                                        Supprimer
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <Pagination meta={meta} onPageChange={setPage} />
            </div>

            <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'edit' ? 'Modifier la voiture' : 'Ajouter une voiture'} size="lg">
                <VoitureForm
                    initial={modal === 'edit' ? selected : emptyForm}
                    categories={categories}
                    onSubmit={handleSave}
                    loading={saving}
                    errors={errors}
                />
            </Modal>

            <ConfirmDialog isOpen={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={handleDelete} loading={deleting}
                           title="Supprimer la voiture" message="Voulez-vous vraiment supprimer cette voiture ?" />
        </div>
    )
}