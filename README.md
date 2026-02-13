# Le Port de Plaisance Russell 15

API REST Express + MongoDB pour la gestion :
- des catways,
- des réservations,
- des utilisateurs.

## Prérequis

- Node.js 18+ (ou version récente compatible)
- MongoDB (local ou distant)
- MongoDB Compass (pour l'import des fichiers JSON)

## Installation

```bash
npm install
```

## Configuration

Créer un fichier `.env` à la racine avec :

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/port_russell
JWT_SECRET=port_russell_secret_2026
ADMIN_EMAIL=admin@russell.com
ADMIN_PASSWORD=123Russell
ADMIN_USERNAME=admin
```

## Données échantillon (Compass)

Les fichiers sont dans `data/` :
- `data/catways.json`
- `data/reservations.json`

Import avec MongoDB Compass :
1. Ouvrir la base cible (ex : `port_russell`).
2. Importer `catways.json` dans la collection `catways`.
3. Importer `reservations.json` dans la collection `reservations`.

## Lancement

```bash
npm run dev
```

ou

```bash
npm start
```

Application disponible par défaut sur `http://localhost:8080`.

## Interfaces web

- Page d'accueil (connexion) : `GET /`
- Tableau de bord (auth requis) : `GET /dashboard`
- Interface CRUD catways (auth requis) : `GET /dashboard/catways`
- Interface CRUD réservations (auth requis) : `GET /dashboard/reservations`
- Interface CRUD utilisateurs (auth requis) : `GET /dashboard/users`
- Documentation API (HTML) : `GET /api-docs`

## Authentification

- `POST /login`
- `GET /logout`
- `POST /logout`
- Compte de connexion :
  - Email : `admin@russell.com`
  - Mot de passe : `123Russell`

Le token JWT est stocké dans un cookie HttpOnly.

## Routes principales

Note :
- Certaines routes sont publiques (lecture).
- Les routes de création, modification et suppression sont protégées (cookie JWT requis).

### Catways
- `GET /catways` (public)
- `GET /catways/:id` (public)
- `POST /catways` (auth requis)
- `PUT /catways/:id` (auth requis)
- `DELETE /catways/:id` (auth requis)

`id` représente le numéro de catway.

### Réservations (ressource globale)
- `GET /reservations` (public)
- `GET /reservations/:id` (public)
- `POST /reservations` (auth requis)
- `PUT /reservations/:id` (auth requis)
- `DELETE /reservations/:id` (auth requis)

### Réservations (sous-ressource catway)
- `GET /catways/:id/reservations` (public)
- `GET /catways/:id/reservations/:idReservation` (public)
- `POST /catways/:id/reservations` (auth requis)
- `PUT /catways/:id/reservations` (auth requis)
- `PUT /catways/:id/reservations/:idReservation` (auth requis)
- `DELETE /catways/:id/reservations/:idReservation` (auth requis)

### Utilisateurs
- `GET /users` (auth requis)
- `GET /users/:email` (auth requis)
- `POST /users` (auth requis)
- `PUT /users/:email` (auth requis)
- `DELETE /users/:email` (auth requis)

## Dépôt GitHub

Dépôt distant configuré :
- `https://github.com/alexiszirnhelt-ai/Le_port_de_plaisance_Russell_15.git`
