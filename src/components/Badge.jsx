const config = {
    // Réservations
    en_attente:  { label: 'En attente',  classes: 'bg-amber-50 text-amber-800 border border-amber-200' },
    confirmee:   { label: 'Confirmée',   classes: 'bg-blue-50 text-blue-800 border border-blue-200' },
    en_cours:    { label: 'En cours',    classes: 'bg-purple-50 text-purple-800 border border-purple-200' },
    terminee:    { label: 'Terminée',    classes: 'bg-green-50 text-green-800 border border-green-200' },
    annulee:     { label: 'Annulée',     classes: 'bg-red-50 text-red-800 border border-red-200' },
    // Voitures
    disponible:  { label: 'Disponible',  classes: 'bg-green-50 text-green-800 border border-green-200' },
    louee:       { label: 'Louée',       classes: 'bg-blue-50 text-blue-800 border border-blue-200' },
    maintenance: { label: 'Maintenance', classes: 'bg-amber-50 text-amber-800 border border-amber-200' },
    hors_service:{ label: 'Hors service',classes: 'bg-red-50 text-red-800 border border-red-200' },
    // Paiements
    complete:    { label: 'Complété',    classes: 'bg-green-50 text-green-800 border border-green-200' },
    rembourse:   { label: 'Remboursé',   classes: 'bg-gray-50 text-gray-700 border border-gray-200' },
    echoue:      { label: 'Échoué',      classes: 'bg-red-50 text-red-800 border border-red-200' },
}

export default function Badge({ statut }) {
    const { label, classes } = config[statut] ?? { label: statut, classes: 'bg-gray-100 text-gray-600' }
    return (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {label}
    </span>
    )
}