# Backlog Pong Backend (Fastify)

## Phase 1 - Base service
- Installer `@fastify/websocket`, config logger, CORS si besoin.
- Extraire `serviceName`, routes `/health` et `/` dans un module `routes/system`.
- Créer `RoomManager` (in-memory) avec CRUD salon, TTL optionnel, génération `roomId` + `linkToken` + `leaderToken`.

## Phase 2 - Contrats API
- Endpoint `POST /rooms` (création) et `GET /rooms/:roomId` (méta). Schémas Fastify stricts.
- Endpoint WebSocket `/rooms/:roomId/connect` avec auth token (leader ou player) et `playerId` généré côté serveur.
- Définir formats d’events JSON (types, payloads) et les documenter.

## Phase 3 - Gestion salon et rôles
- Messages serveur : `room:state` complet initial, puis diff (option).
- Actions leader : `room:update-settings`, `room:transfer-lead`, `game:start`.
- Actions joueurs : `player:update-team`, `player:update-color`, validation slots par équipe.
- Gestion des déconnexions / timeouts, réattribution du lead.

## Phase 4 - Moteur de jeu
- Boucle de tick serveur (30/60 Hz) par salon ; module physique (balle, paddles, collisions, murs).
- Application des inputs (`up|down|both|none`) + IA (si bot) + limites terrain.
- Mise à jour des scores ; reset balle après point ; status `waiting|running|ended`.
- Détection des incohérences client → émission `game:resync` avec état complet.

## Phase 5 - Observabilité et robustesse
- Logs structurés (roomId, playerId, event type).
- Métriques simples (comptage de salons actifs, joueurs connectés) via `/metrics` ou logger.
- Tests unitaires (RoomManager, moteur physique) et e2e WebSocket minimal.

## Phase 6 - Extension / scale
- Interface de stockage pour passer à Redis/pubsub (si multi-instance).
- Back-pressure WebSocket (throttle inputs, taille de payload).
- Durcissement sécurité (rate limit sur création de rooms, validation stricte des schemas).
