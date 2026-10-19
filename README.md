# Location de voitures — Interface web

Interface de gestion (tableau de bord) pour une agence de location de voitures. Elle consomme l'API Laravel du dépôt [location-voitures-api](https://github.com/Kouameanaset/location-voitures-api).

## Technologies

- React 19 et Vite
- React Router (navigation entre les pages)
- Axios (appels HTTP vers l'API)
- Tailwind CSS 4

## Fonctionnalités

- **Tableau de bord** : statistiques (voitures disponibles, clients, revenus, réservations actives) et dernières réservations.
- **Voitures** : liste avec filtres (statut, catégorie, recherche), création, modification et suppression.
- **Réservations** : liste filtrable et paginée, création avec aperçu du prix estimé (nombre de jours × tarif journalier de la catégorie), changement de statut. Le prix final est confirmé par le serveur.
- **Clients, catégories et paiements** : pages de gestion avec formulaires modaux.
- Composants réutilisables : fenêtre modale, boîte de confirmation, pagination, badges de statut, barre latérale.

## Structure

```
src/
  api/          Fonctions d'appel à l'API (une par ressource) et client Axios
  components/   Composants réutilisables
  pages/        Dashboard, Voitures, Reservations, Clients, Categories, Paiements
```

## Installation

Prérequis : Node.js et npm, et l'API démarrée.

```bash
npm install
npm run dev
```

L'URL de l'API est définie dans `src/api/axios.js` (`http://localhost/api` par défaut). Modifiez-la si l'API tourne ailleurs, par exemple `http://localhost:8000/api` avec `php artisan serve`.

## Commandes

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Sert le build localement |
| `npm run lint` | Analyse du code avec ESLint |

## Limites connues

- Pas de page de connexion : l'API n'est pas encore protégée.
- Pas de tests automatisés.

## Projet scolaire

Projet réalisé dans le cadre du programme Techniques de l'informatique, Cégep Saint-Jean-sur-Richelieu.
