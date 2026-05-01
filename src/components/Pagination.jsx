export default function Pagination({ meta, onPageChange }) {
    if (!meta || meta.last_page <= 1) return null

    const { current_page, last_page, from, to, total } = meta

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
                {from}–{to} sur {total} résultats
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page === 1}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    ← Précédent
                </button>
                <span className="px-3 py-1.5 text-xs text-gray-600">
          Page {current_page} / {last_page}
        </span>
                <button
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={current_page === last_page}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Suivant →
                </button>
            </div>
        </div>
    )
}