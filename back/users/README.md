# Users Back

Service Fastify gérant l'authentification et le profil des utilisateurs pour Transcendance. Il expose des routes JSON stateless, stocke les comptes dans SQLite et conserve les sessions côté Redis via un cookie HTTP‑Only.

##TODO
	-donner une id aleatoire et non ++
	-verifier si l'id aleatoire donner est pas deja prise.
	-cree cookie guest pour 3h suprimer les guest acount expirer toutes les heures
	-nom obligatoire pour le guest
	-avatar par default
	-ajouter setings de base par jeux et historique dans la db
	-ne pas cree de nouveau user si connecter
	-limiter l'acces a l'api au front

## Démarrage rapide
- `PORT` est obligatoire. Exemple : `PORT=4001`.
- Installer les dépendances : `npm install`.
- Lancer le service : `npm start`.

### Variables d'environnement
- `PORT` (obligatoire) : port d'écoute HTTP.
- `SQLITE_DB_PATH` (optionnel) : chemin vers la base (`data/users.sqlite` par défaut).
- `REDIS_URL` : URL Redis pour les sessions (`redis://localhost:6379/0` par défaut).
- `SESSION_TTL_SECONDS` : durée de vie des sessions (86400s par défaut).
- `SESSION_COOKIE_NAME` : nom du cookie (par défaut `transcendance_session`).
- `COOKIE_SECRET` : secret utilisé par `@fastify/cookie`.
- `NODE_ENV` : bascule `secure` sur le cookie en production.

## Sessions & authentification
- Un login / register / guest crée une session Redis (`session:<uuid>`) et renvoie un cookie HTTP‑Only `transcendance_session`.
- Les routes marquées « Session requise » refusent les requêtes sans ce cookie (401).
- Le logout ou la suppression détruit la session et efface le cookie.

## Format des réponses
Toutes les réponses utilisent `buildOk` / `buildError` :

```
{
	"status": "ok" | "error",
	"service": "users-back",
	"version": "1.0.0",
	"message": "...",
	...payload spécifique
}
```

## Routes

### POST `/login`
- Session requise : Non.
- Corps JSON :
```
{
	"email": "user@example.com",
	"password": "secret"
}
```
- Réponses : `200` (cookie + `user` public), `401` (identifiants invalides), `400` (champs manquants).
- Exemple :
```
curl -i -X POST http://localhost:4001/login \
	-H "Content-Type: application/json" \
	-d '{"email":"user@example.com","password":"secret"}'
```

### POST `/logout`
- Session requise : Oui (sinon succès silencieux).
- Corps : vide.
- Réponses : `200` (« User logged out »). Efface le cookie côté client.

### POST `/register`
- Session requise : Non.
- Corps JSON :
```
{
	"email": "user@example.com",
	"password": "secret",
	"displayName": "Ada",
	"avatarUrl": "https://..."
}
```
- Réponses : `200` (création + cookie + `user`), `400` (champs manquants), `409` (email déjà utilisé).

### POST `/guest`
- Session requise : Non.
- Corps : vide.
- Effet : crée un compte invité (mot de passe vide) et renvoie le cookie de session.

### POST `/delete`
- Session requise : Oui.
- Corps : vide.
- Effet : supprime l'utilisateur courant, détruit la session et efface le cookie. `401` si non authentifié.

### POST `/update/name`
- Session requise : Oui.
- Corps JSON :
```
{
	"displayName": "Ada Lovelace"
}
```
- Réponses : `200` (nouveau `user`), `400` si champ absent, `401` si session absente.

### POST `/update/email`
- Session requise : Oui.
- Corps JSON :
```
{
	"email": "new@example.com"
}
```
- Réponses : `200` (email mis à jour), `409` (email déjà utilisé), `400` (champ absent), `401` (session manquante).

### POST `/update/password`
- Session requise : Oui.
- Corps JSON :
```
{
	"currentPassword": "old",
	"newPassword": "new"
}
```
- Réponses : `200` (hash mis à jour), `400` (champs manquants), `401` (mot de passe actuel invalide ou session absente).

### POST `/update/avatar`
- Session requise : Oui.
- Corps JSON :
```
{
	"avatarUrl": "https://cdn/...png"
}
```
- Réponses : `200` (avatar mis à jour), `400` (champ absent), `401` (session absente).

### GET `/user`
- Session requise : Oui.
- Réponse : `user` public (sans `passwordHash`). `401` si non authentifié.

### GET `/user/profile`
- Session requise : Oui.
- Réponse : `profile` avec `id`, `displayName`, `avatarUrl`, `isGuest`, `createdAt`.

### GET `/user/avatar`
- Session requise : Oui.
- Réponse : `avatarUrl`.

### GET `/user/name`
- Session requise : Oui.
- Réponse : `displayName`.

### GET `/user/:userId`
- Session requise : Non.
- Paramètre : `userId` numérique.
- Réponses : `200` (`user` public), `400` (id invalide), `404` (introuvable).

### GET `/user/profile/:userId`
- Session requise : Non.
- Réponse : `profile` de l'utilisateur cible. Même gestion des erreurs que ci‑dessus.

### GET `/user/avatar/:userId`
- Session requise : Non.
- Réponse : `avatarUrl` ou `404`.

### GET `/user/name/:userId`
- Session requise : Non.
- Réponse : `displayName` ou `404`.

### GET `/`
- Session requise : Non.
- Renvoie la bannière de service (`description: "API for users management"`).

### GET `/health`
- Session requise : Non.
- Renvoie un simple `status: ok` pour les probes.

## Stockage
- SQLite (`better-sqlite3`) : schéma créé automatiquement dans `SQLITE_DB_PATH`.
- Redis (`ioredis`) : stockage des sessions via les clés `session:<uuid>`.

## Dépannage rapide
- Vérifier `PORT` défini sinon le processus lève une exception au démarrage.
- Les erreurs 401 indiquent généralement un cookie expiré ou absent.
- En cas de corruption d'une session, supprimer sa clé `session:<id>` côté Redis suffit.


