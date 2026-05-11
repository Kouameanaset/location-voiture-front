import { useEffect, useState, useCallback } from 'react'
import { getCategories, createCategorie, updateCategorie, deleteCategorie, getCategorieVoitures } from '../api/categories'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

const emptyForm = { nom: '', description: '', tarif_journalier: '' }

/**
 * Sous-composant formulaire catégorie. Sert pour ajout et modification
 * @param initial
 * @param onSubmit
 * @param loading
 * @param errors
 * @returns {JSX.Element}
 * @constructor
 */
function CategorieForm({ initial = emptyForm, onSubmit, loading, errors }) {
    const [form, setForm] = useState(initial)
    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    return (
        <div className="flex flex-col gap-4">
            <div>
                <label className="label">Nom *</label>
                <input className="input" value={form.nom} onChange={set('nom')} placeholder="Économique" />
                {errors?.nom && <p className="text-xs text-red-500 mt-1">{errors.nom[0]}</p>}
            </div>
            <div>
                <label className="label">Description</label>
                <textarea className="input" rows={2} value={form.description ?? ''} onChange={set('description')} placeholder="Description de la catégorie..." />
            </div>
            <div>
                <label className="label">Tarif journalier ($) *</label>
                <input className="input" type="number" step="0.01" min="0" value={form.tarif_journalier} onChange={set('tarif_journalier')} placeholder="55.00" />
                {errors?.tarif_journalier && <p className="text-xs text-red-500 mt-1">{errors.tarif_journalier[0]}</p>}
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <button className="btn btn-primary" onClick={() => onSubmit(form)} disabled={loading}>
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
            </div>
        </div>
    )
}

/**
 * Page principale Categories. Gestion CRUD des catégories
 * @returns {JSX.Element}
 * @constructor
 */
export default function Categories() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading]       = useState(true)
    const [modal, setModal]           = useState(null) // 'create' | 'edit' | 'voitures'
    const [selected, setSelected]     = useState(null)
    const [confirmId, setConfirmId]   = useState(null)
    const [saving, setSaving]         = useState(false)
    const [deleting, setDeleting]     = useState(false)
    const [errors, setErrors]         = useState({})
    const [apiError, setApiError]     = useState('')

    // État pour les voitures de la catégorie sélectionnée
    const [voitures, setVoitures]         = useState([])
    const [voituresLoading, setVoituresLoading] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getCategories({ per_page: 100 })
            setCategories(res.data.data)
        } finally { setLoading(false) }
    }, [])

    useEffect(() => { load() }, [load])

    const handleVoitures = async (categorie) => {
        setSelected(categorie)
        setModal('voitures')
        setVoituresLoading(true)
        try {
            const res = await getCategorieVoitures(categorie.id)
            setVoitures(res.data.data)
        } finally {
            setVoituresLoading(false)
        }
    }

    const handleSave = async (form) => {
        setSaving(true);
        setErrors({});
        setApiError('')
        try {
            if (modal === 'edit') await updateCategorie(selected.id, form)
            else await createCategorie(form)
            setModal(null)
            load()
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors)
            else setApiError(err.response?.data?.message || 'Une erreur est survenue.')
        } finally { setSaving(false) }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await deleteCategorie(confirmId)
            setConfirmId(null); load()
        } catch (err) {
            setApiError(err.response?.data?.message || 'Impossible de supprimer.')
            setConfirmId(null)
        } finally { setDeleting(false) }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Catégories</h1>
                <button className="btn btn-primary" onClick={() => { setSelected(null); setErrors({}); setModal('create') }}>
                    + Nouvelle catégorie
                </button>
            </div>

            {apiError && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{apiError}</div>}

            {loading ? (
                <p className="text-sm text-gray-400">Chargement...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((c) => (
                        <div key={c.id} className="card flex flex-col gap-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{c.nom}</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">{c.nb_voitures ?? '—'} voiture(s)</p>
                                </div>
                                <span className="text-lg font-bold text-gray-900">
                  {c.tarif_journalier} $
                  <span className="text-xs font-normal text-gray-400">/jour</span>
                </span>
                            </div>
                            {c.description && <p className="text-sm text-gray-500">{c.description}</p>}
                            <div className="flex flex-col gap-2 pt-1 border-t border-gray-50">
                                {/* Bouton voir les voitures */}
                                <button
                                    className="btn btn-secondary py-1 px-3 text-xs w-full justify-center"
                                    onClick={() => handleVoitures(c)}
                                >
                                    🚗 Voir les voitures ({c.nb_voitures ?? 0})
                                </button>
                                <div className="flex gap-2">
                                    <button className="btn btn-secondary py-1 px-3 text-xs flex-1" onClick={() => { setSelected(c); setErrors({}); setModal('edit'); setApiError('') }}>
                                        Modifier
                                    </button>
                                    <button className="btn btn-danger py-1 px-3 text-xs flex-1" onClick={() => setConfirmId(c.id)}>
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'edit' ? 'Modifier la catégorie' : 'Nouvelle catégorie'} size="sm">
                <CategorieForm initial={modal === 'edit' ? selected : emptyForm} onSubmit={handleSave} loading={saving} errors={errors} />
            </Modal>

            <Modal isOpen={modal === 'voitures'} onClose={() => setModal(null)} title={`Voitures — ${selected?.nom}`} size="lg">
                {voituresLoading ? (
                    <p className="text-sm text-gray-400 py-4 text-center">Chargement...</p>
                ) : voitures.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4 text-center">Aucune voiture dans cette catégorie.</p>
                ) : (
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-100">
                            <th className="table-th">Véhicule</th>
                            <th className="table-th">Immatriculation</th>
                            <th className="table-th">Kilométrage</th>
                            <th className="table-th">Statut</th>
                        </tr>
                        </thead>
                        <tbody>
                        {voitures.map((v) => (
                            <tr key={v.id} className="table-tr">
                                <td className="table-td">
                                    <div className="font-medium">{v.marque} {v.modele}</div>
                                    <div className="text-xs text-gray-400">{v.annee} · {v.couleur}</div>
                                </td>
                                <td className="table-td font-mono text-xs text-gray-500">{v.immatriculation}</td>
                                <td className="table-td text-gray-500">{Number(v.kilometrage).toLocaleString()} km</td>
                                <td className="table-td"><Badge statut={v.statut} /></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </Modal>

            <ConfirmDialog isOpen={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={handleDelete} loading={deleting}
                           title="Supprimer la catégorie" message="Attention : cette action est irréversible. Voulez-vous vraiment supprimer cette catégorie ?" />
        </div>
    )
}