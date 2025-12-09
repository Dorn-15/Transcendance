Transcendance;

WebSocket Gateway unique + services métier indépendants

Architecture pensée pour :
	- Des Mini-jeux en temps réel
	- Chat, rooms, matchmaking
	- Authentification centralisée
	- Scalabilité horizontale
	- Un point d’entrée WebSocket unique pour simplifier le front

========================================================
🧱 Services
--------------------------------------------------------
1. reverse-proxy (Nginx)

Rôle :
	Point d’entrée unique HTTP + WS
	Termine HTTPS

Route vers:
	-front-ssr (Next.js)
	-auth-service
	-social-service
	-room-service
	-game-service
	-matchmaking
	-realtime-gateway (WebSocket)

Routes principales :
/                → front-ssr
/api/auth        → auth-service
/api/social      → social-service
/api/rooms       → room-service
/api/games       → game-service
/api/matchmaking → matchmaking
/ws              → realtime-gateway (WebSockets)

-----------------------------------------------------------
2. frontend (Next.js + React)
Rôle:
	- UI complète
	- SSR pour pages, home, profils, rooms, game(pong, breakout, ect).
	- Connexion WebSocket au gateway (/ws)
	- Appels API vers les autres services

Ne contient aucune logique métier autre que le ssr.

-----------------------------------------------------------
3. auth-service (NestJS + Postgres)

Responsabilités :
	- Inscription, login, logout, supression compte, modif profil
	- Gestion des utilisateurs (id, pseudo, avatar, mail, pasword)
	- Émission/validation des JWT
	- Stockage en DB (Postgres)
API (exemple) :
	- POST /api/auth/register
	- POST /api/auth/login
	- GET  /api/auth/me

-----------------------------------------------------------
4. realtime-gateway (NestJS WebSocket Gateway)

Responsabilités :
	- Unique point d’entrée WebSocket pour tous les clients
	- Authentification WS (JWT)
	- Gestion des WebSocket rooms (transport)
	- Réception des commandes WS → routage vers les services métier
	- Diffusion des événements temps réel aux clients
	- Ne contient aucune logique métier, seulement du “transport”.
Utilise Redis pour :
	- Pub/Sub broadcast entre instances
	- Maintien de la cohérence des rooms distribué
Messages reçus (exemple) :
	- chat:sendMessage
	- room:join
	- room:leave
	- game:playerAction
	- matchmaking:joinQueue

-----------------------------------------------------------
5. social-service (NestJS + Redis + Postgres)

Responsabilités :
	- Chat global
	- Chat des rooms
	- Messages privés
	- Statut des joueurs : en ligne / en partie

Communication :
	- Reçoit les commandes via HTTP ou Pub/Sub Redis envoyées par le gateway
	- Notifie le gateway pour broadcast WS

-----------------------------------------------------------
6. room-service (NestJS + Postgres)

Responsabilités :
	- Création/suppression de rooms
	- Gestion des participants
	- Permissions (host, spectateurs, etc.)
	- Stockage en DB (rooms, settings, historique)
Flux typique :
	- Client → WS → gateway
	- gateway → room-service (HTTP)
	- room-service renvoie l’état
	- gateway rejoint la WS room & notifie les clients

-----------------------------------------------------------
7. matchmaking-service (NestJS + Redis + Postgres)

Responsabilités :
	- Files de matchmaking (1v1, 2v2, FFA)
	- Algorithmes de pairing
	- Création automatique d’une room de jeu
	- Communication avec game-service pour créer une partie

Utilise Redis pour :
	- Files d’attente
	- Atomicité des opérations

-----------------------------------------------------------
8. game-service (NestJS ou Node “nu” selon les performances)

Responsabilités :
	- Logique des jeux
	- Validation des actions des joueurs
	- Calcul des scores / état du jeu
	- Stockage des résultats en Postgres
Flux :
	- Client → WS → gateway (game:playerAction)
	- gateway → game-service (HTTP ou Redis)
	- game-service calcule l’état et retourne une mise à jour
	- gateway broadcast WS aux joueurs

Option :
	- Un service par type de jeu (game-service-puzzle, game-service-race, etc.)

-----------------------------------------------------------
9. postgres (DB relationnelle)

Schémas recommandés :
	- auth → comptes
	- social → messages, historique
	- rooms → metadata des rooms
	- matchmaking → historiques de matchs
	- game → scores, résultats
	- Chaque service a son propre utilisateur DB avec droits limités.

-----------------------------------------------------------
10. redis (Cache + Pub/Sub + queues)

Rôles :
	- Pub/Sub entre instances du gateway
	- Files de matchmaking
	- Cache user/session si nécessaire
	- Passage interne d’événements entre services

========================================================

🕸️ Architecture globale (vue simplifiée)
                            ┌─────────────────────┐
                            │       Clients       │
                            │   (Browser / WS)    │
                            └─────────┬───────────┘
                                      │
                               HTTPS / WSS
                                      │
                           ┌──────────▼───────────┐
                           │       NGINX          │
                           └─────┬───────┬────────┘
               HTTP              │       │              WS
         ┌───────────┬───────────┘       └───────────────┬─────────┐
         ▼           ▼                                   ▼         ▼
 frontend-ssr   auth-service                         realtime-gateway
                     │                                        │
                     ▼                                        │ Pub/Sub
                  Postgres                                    │
                     ▲                                        ▼
                ┌────┴───────────┐                  ┌──────────────────────┐
                │                │                  │                      │
          social-service     room-service  matchmaking-service       game-service
                │     ▲          │                  ▲                      │
                └─────┴──────────┴──────────────────┴──────────────────────┘
                                Redis (cache, pub/sub, queues)

🎯 Avantages de cette architecture
✔ Un seul WebSocket côté client
→ plus simple, plus stable, moins de bugs réseau.

✔ Services métier indépendants
→ chaque service peut scaler séparément.

✔ Scalable horizontalement
Gateway WebSocket + Redis Pub/Sub = multi-instances prêtes.

✔ Idéal pour mini-jeux temps réel
Les pics de charge sur un jeu n’impactent pas le matchmaking ou le chat.

========================================================