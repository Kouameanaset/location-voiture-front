import { useEffect, useState, useCallback } from 'react'
import { getClients, createClient, updateClient, deleteClient } from '../api/clients'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'

const emptyForm = { nom: '', prenom: '', email: '', telephone: '', permis_numero: '', permis_expiration: '' }

function ClientForm({ initial = emptyForm, onSubmit, loading, errors }) {
    const [form, setForm] = useState(initial)
    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label">Nom *</label>
                    <input className="input" value={form.nom} onChange={set('nom')} placeholder="Tremblay" />
                    {errors?.nom && <p className="text-xs text-red-500 mt-1">{errors.nom[0]}</p>}
                </div>
                <div>
                    <label className="label">Prénom *</label>
                    <input className="input" value={form.prenom} onChange={set('prenom')} placeholder="Sophie" />
                    {errors?.prenom && <p className="text-xs text-red-500 mt-1">{errors.prenom[0]}</p>}
                </div>
            </div>
            <div>
                <label className="label">Courriel *</label>
                <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="sophie@email.com" />
                {errors?.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
            </div>
            <div>
                <label className="label">Téléphone</label>
                <input className="input" value={form.telephone} onChange={set('telephone')} placeholder="514-555-0101" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label">N° de permis *</label>
                    <input className="input" value={form.permis_numero} onChange={set('permis_numero')} placeholder="T1234-567890-00" />
                    {errors?.permis_numero && <p className="text-xs text-red-500 mt-1">{errors.permis_numero[0]}</p>}
                </div>
                <div>
                    <label className="label">Expiration permis *</label>
                    <input className="input" type="date" value={form.permis_expiration} onChange={set('permis_expiration')} />
                    {errors?.permis_expiration && <p className="text-xs text-red-500 mt-1">{errors.permis_expiration[0]}</p>}
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

export default function Clients() {
    const [clients, setClients]         = useState([])
    const [meta, setMeta]               = useState(null)
    const [page, setPage]               = useState(1)
    const [search, setSearch]           = useState('')
    const [loading, setLoading]         = useState(true)
    const [modal, setModal]             = useState(null) // null | 'create' | 'edit'
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
            if (search) params.nom = search
            const res = await getClients(params)
            setClients(res.data.data)
            setMeta(res.data.meta)
        } finally {
            setLoading(false)
        }
    }, [page, search])

    useEffect(() => { load() }, [load])

    const handleSave = async (form) => {
        setSaving(true); setErrors({}); setApiError('')
        try {
            if (modal === 'edit') {
                await updateClient(selected.id, form)
            } else {
                await createClient(form)
            }
            setModal(null); load()
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors)
            else setApiError(err.response?.data?.message || 'Une erreur est survenue.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true); setApiError('')
        try {
            await deleteClient(confirmId)
            setConfirmId(null); load()
        } catch (err) {
            setApiError(err.response?.data?.message || 'Impossible de supprimer.')
            setConfirmId(null)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
                <button className="btn btn-primary" onClick={() => { setSelected(null); setErrors({}); setModal('create') }}>
                    + Nouveau client
                </button>
            </div>

            {apiError && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{apiError}</div>
            )}

            {/* Filtres */}
            <div className="card mb-4">
                <input
                    className="input max-w-xs"
                    placeholder="Rechercher par nom..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
            </div>

            {/* Table */}
            <div className="card p-0 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="table-th">Nom</th>
                        <th className="table-th">Courriel</th>
                        <th className="table-th">Téléphone</th>
                        <th className="table-th">Permis</th>
                        <th className="table-th">Expiration</th>
                        <th className="table-th">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr><td colSpan={6} className="table-td text-center text-gray-400 py-10">Chargement...</td></tr>
                    ) : clients.length === 0 ? (
                        <tr><td colSpan={6} className="table-td text-center text-gray-400 py-10">Aucun client trouvé.</td></tr>
                    ) : clients.map((c) => (
                        <tr key={c.id} className="table-tr">
                            <td className="table-td font-medium">{c.prenom} {c.nom}</td>
                            <td className="table-td text-gray-500">{c.email}</td>
                            <td className="table-td text-gray-500">{c.telephone ?? '—'}</td>
                            <td className="table-td text-gray-500 font-mono text-xs">{c.permis_numero}</td>
                            <td className="table-td text-gray-500">{c.permis_expiration}</td>
                            <td className="table-td">
                                <div className="flex gap-2">
                                    <button className="btn btn-secondary py-1 px-3 text-xs" onClick={() => { setSelected(c); setErrors({}); setModal('edit') }}>
                                        Modifier
                                    </button>
                                    <button className="btn btn-danger py-1 px-3 text-xs" onClick={() => setConfirmId(c.id)}>
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

            {/* Modal create/edit */}
            <Modal
                isOpen={!!modal}
                onClose={() => setModal(null)}
                title={modal === 'edit' ? 'Modifier le client' : 'Nouveau client'}
            >
                <ClientForm
                    initial={modal === 'edit' ? { ...selected, permis_expiration: selected?.permis_expiration ?? '' } : emptyForm}
                    onSubmit={handleSave}
                    loading={saving}
                    errors={errors}
                />
            </Modal>

            {/* Confirm delete */}
            <ConfirmDialog
                isOpen={!!confirmId}
                onClose={() => setConfirmId(null)}
                onConfirm={handleDelete}
                loading={deleting}
                title="Supprimer le client"
                message="Cette action est irréversible. Voulez-vous vraiment supprimer ce client ?"
            />
        </div>
    )
}