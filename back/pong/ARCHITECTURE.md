# Microservice Pong - Architecture Proposée

## État actuel (`server.js`)
- Fastify expose seulement `/` et `/health`, avec un handler fallback.
- Aucun WebSocket, aucune gestion de salons, de joueurs ou de logique de partie.
- Le service tourne sur `:4001` et sert uniquement de ping pour l’instant.

## Objectifs fonctionnels
- Créer des salons Pong (max 10 personnes) avec un lien unique de connexion.
- Leader du salon : changer paramètres (joueurs/équipe 1-5, taille/vitesse raquette, durée de partie, vitesse initiale balle, force IA, transfert du lead).
- Autres joueurs : choisir équipe (gauche, droite, neutre) si slot dispo et couleur de raquette perso.
- Démarrer une game, gérer scores et physique (balle + raquettes), maintenir l’état serveur comme source de vérité.
- Sync temps-réel via WebSocket ; chaque client reçoit l’état complet, envoie ses inputs (top/bottom/two/null) + positions locales pour resync possible.

## Architecture générale
- **Fastify HTTP** pour la création et l’info des salons.
- **WebSocket** (`@fastify/websocket`) pour les flux temps-réel et la diffusion d’état.
- **RoomManager** Redis + TTL stockant : `Room`, `Players`, `GameSettings`, `GameState`.
- **GameLoop** par salon (interval/timer) qui applique inputs, met à jour la physique, vérifie collisions et scores, puis diffuse l’instantané.
- **Autorité serveur** : le serveur calcule la physique, valide positions, et force un resync si dérive.

## Modèle de domaine (proposé)
- `Room`: `id`, `linkToken`, `leaderId`, `settings`, `state`, `createdAt`, `updatedAt`, `status (waiting|running|ended)`.
- `Player`: `id`, `name` (optionnel), `team (left|right|neutral)`, `color`, `isLeader`, `socket`, `lastInput`, `isBot`.
- `GameSettings`: `playersPerTeam (1-5)`, `paddleSize`, `paddleSpeed`, `ballSpeedInit`, `aiStrength`, `maxPlayers (10)`, 'bestof(5-21)'.
- `GameState`: `score {left,right}`, `ball {x(0.0-400.0),y(0.0-300.0),vx(0.0-1.0),vy(0.0-1.0),speed(ballSpeedInit-ballSpeedInit*5)}`, `paddles {playerId, x, y, vy}`, `tick`, `countdown`, `historyVersion`.

## API & flux
- HTTP:
  - `POST /rooms` → crée un salon, retourne `roomId`, `joinLink`, `leaderToken`.
  - `GET /rooms/:roomId` → méta (slots libres, status).
- WebSocket (ws `/rooms/:roomId/connect?playerId=...&token=...`):
  - Dès connexion : envoi `room:state` complet.
  - Clients → serveur : `player:input` `{input: up|down|both|none, predicted: {ball, paddle}}`.
  - Leader → serveur : `room:update-settings`, `room:transfer-lead`, `game:start`.
  - Serveur → tous : `room:state` (delta ou full), `game:tick`, `game:resync` si positions invalides.

## Synchronisation et validation
- Tick serveur (ex. 30/60 Hz) applique inputs à l’état autoritaire.
- Si la position envoyée par un client diverge (hors aire ou collision impossible), le serveur renvoie `game:resync` avec l’état complet.
- Score mis à jour côté serveur uniquement ; clients affichent l’état reçu.
- Déconnexion : libère slot, si leader part → transfert auto au prochain ou au neutre.

## Scalabilité & résilience
- In-memory suffisant pour débuter ; prévoir interface de stockage pour passer à Redis/pubsub si multi-instance.
- UUID pour `roomId` et `linkToken`; éviter collisions et permettre liens partageables.
- Back-pressure WebSocket : limiter fréquence d’inputs (throttle) et taille des payloads.

## Sécurité
- Jeton leader distinct pour autoriser les changements de settings.
- Validation de toutes les payloads (schema Fastify) pour éviter corruption d’état.
- Logs structurés (roomId, playerId) pour traçabilité des parties.
