import Modal from './Modal'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
                <button onClick={onClose} className="btn btn-secondary">
                    Annuler
                </button>
                <button onClick={onConfirm} disabled={loading} className="btn btn-danger">
                    {loading ? 'Suppression...' : 'Supprimer'}
                </button>
            </div>
        </Modal>
    )
}