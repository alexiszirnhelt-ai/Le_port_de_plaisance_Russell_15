# Le Port de Plaisance Russell 15

API REST Express + MongoDB pour la gestion:
- des catways,
- des reservations,
- des utilisateurs.

## Prerequis

- Node.js 18+ (ou version recente compatible)
- MongoDB (local ou distant)
- MongoDB Compass (pour l'import des fichiers JSON)

## Installation

```bash
npm install
```

## Configuration

Creer un fichier `.env` a la racine avec:

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/port_russell
JWT_SECRET=port_russell_secret_2026
ADMIN_EMAIL=admin@russell.com
ADMIN_PASSWORD=123Russell
ADMIN_USERNAME=admin
```

## Donnees echantillon (Compass)

Les fichiers sont dans `data/`:
- `data/catways.json`
- `data/reservations.json`

Import avec MongoDB Compass:
1. Ouvrir la base cible (ex: `port_russell`).
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

Application disponible par defaut sur `http://localhost:8080`.

## Interfaces

- Page d'accueil (connexion): `GET /`
- Tableau de bord (auth requis): `GET /dashboard`
- Documentation API (HTML): `GET /api-docs`

## Authentification

- `POST /login`
- `GET /logout`
- Compte de connexion:
  - Email: `admin@russell.com`
  - Mot de passe: `123Russell`

Le token JWT est stocke dans un cookie HTTP only.

## Routes principales

### Catways
- `GET /catways`
- `GET /catways/:id`
- `POST /catways`
- `PUT /catways/:id`
- `DELETE /catways/:id`

`id` represente le numero de catway.

### Reservations (sous-ressource catway)
- `GET /catways/:id/reservations`
- `GET /catways/:id/reservations/:idReservation`
- `POST /catways/:id/reservations`
- `PUT /catways/:id/reservations`
- `PUT /catways/:id/reservations/:idReservation`
- `DELETE /catways/:id/reservations/:idReservation`

### Utilisateurs
- `GET /users`
- `GET /users/:email`
- `POST /users`
- `PUT /users/:email`
- `DELETE /users/:email`

## Deploiement

Le projet est deployable sur une plateforme de ton choix (Render, Railway, VPS, etc.).

Minimum a configurer en production:
- `MONGODB_URI`
- `JWT_SECRET`
- `PORT` (souvent fourni par la plateforme)

Renseigner ici l'URL de production:
- `https://...`

## Depot GitHub

Depot distant configure:
- `https://github.com/alexiszirnhelt-ai/Le_port_de_plaisance_Russell_15.git`
