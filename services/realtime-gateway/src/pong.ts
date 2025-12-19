import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import type {
	MatchJoin,
	PongDirection,
	PongState,
	DisconnectResult,
} from '@transcendance/pong';

interface MatchTracker {
	sockets: Set<string>;
	interval?: NodeJS.Timeout;
}

@Injectable()
export class PongExchangeService {
	private readonly	logger = new Logger('PongExchangeService');
	private			server: Server | null = null;
	private readonly	matchTrackers = new Map<string, MatchTracker>();
	private readonly	clientSessions = new Map<
		string,
		Array<{ matchId: string; player: string }>
	>();
	private readonly	gamesBaseUrl =
		process.env.GAMES_BASE_URL ?? process.env.GAME_HOST ?? 'http://localhost:4005';
	private readonly	fetcher: any = (globalThis as any).fetch;

	setServer(server: Server): void {
		this.server = server;
	}

	async handleCreateMatch(
		client: Socket,
		payload: { player: string },
	): Promise<MatchJoin | { error: string }> {
		try {
			const	body = { player: payload?.player ?? 'player' };
			const	response = await this.postJson<MatchJoin>('/pong/matches', body);

			await client.join(this.getRoom(response.matchId));
			this.registerClient(response.matchId, client.id);
			this.registerClientSession(client.id, response.matchId, body.player);
			this.startPolling(response.matchId);

			this.emitState(response.matchId, response.state);

			return response;
		} catch (error) {
			const	message = (error as Error).message;
			this.logger.error(message);
			return { error: message };
		}
	}

	async handleJoinMatch(
		client: Socket,
		payload: { matchId?: string; player: string },
	): Promise<MatchJoin | { error: string }> {
		try {
			const	body = {
				player: payload?.player ?? 'player',
				matchId: payload?.matchId,
			};
			const	path = `/pong/matches/${payload?.matchId}/join`;
			const	response = await this.postJson<MatchJoin>(path, body);

			await client.join(this.getRoom(response.matchId));
			this.registerClient(response.matchId, client.id);
			this.registerClientSession(client.id, response.matchId, body.player);
			this.startPolling(response.matchId);

			this.emitState(response.matchId, response.state);

			return response;
		} catch (error) {
			const	message = (error as Error).message;
			this.logger.error(message);
			return { error: message };
		}
	}

	// --- AJOUT : Gestion du départ volontaire (Mise en pause) ---
	async handleLeaveMatch(
		client: Socket,
		payload: { matchId?: string }
	): Promise<void> {
		const sessions = this.clientSessions.get(client.id);
		if (!sessions) return;

		// Si un matchId est fourni, on ne quitte que celui-là. Sinon tous.
		const sessionsToLeave = payload?.matchId
			? sessions.filter((s) => s.matchId === payload.matchId)
			: sessions;

		for (const session of sessionsToLeave) {
			try {
				// 1. On prévient le moteur de jeu que le joueur est "parti"
				// Cela doit déclencher le statut 'paused' côté moteur
				await this.notifyDisconnect(session);
				
				// 2. On retire le joueur de la room socket
				client.leave(this.getRoom(session.matchId));
				
				// 3. On arrête de suivre ce client pour ce match dans le service
				this.unregisterClient(session.matchId, client.id);

				// 4. On nettoie la session locale
				const remaining = (this.clientSessions.get(client.id) ?? [])
					.filter(s => s.matchId !== session.matchId);
				this.clientSessions.set(client.id, remaining);

				this.logger.log(`Client ${client.id} left match ${session.matchId} (Paused)`);
			} catch (error) {
				this.logger.warn(`Error handling leave for match ${session.matchId}: ${(error as Error).message}`);
			}
		}
	}

	// --- AJOUT : Gestion de l'arrêt total (Destruction) ---
	async handleStopMatch(
		client: Socket, 
		payload: { matchId?: string }
	): Promise<void> {
		// Logique similaire à leave, mais on pourrait appeler un endpoint DELETE
		// Pour l'instant, on fait un leave propre pour s'assurer que c'est nettoyé
		await this.handleLeaveMatch(client, payload);
		
		// TODO: Si tu as un endpoint DELETE sur ton moteur de jeu, appelle-le ici :
		// await this.fetcher(`${this.gamesBaseUrl}/pong/matches/${payload.matchId}`, { method: 'DELETE' });
	}

	async handleMove(
		client: Socket,
		payload: { matchId: string; player: string; direction: PongDirection },
	): Promise<{ state?: PongState; error?: string }> {
		if (!payload?.matchId) {
			return { error: 'matchId manquant' };
		}

		const	body = {
			player: payload.player ?? 'player',
			direction: payload.direction ?? 'none',
		};

		try {
			const	state = await this.postJson<PongState>(
				`/pong/matches/${payload.matchId}/input`,
				body,
			);

			if (client.rooms.has(this.getRoom(payload.matchId))) {
				this.emitState(payload.matchId, state);
			}

			return { state };
		} catch (error) {
			const	message = (error as Error).message;
			this.logger.error(message);
			return { error: message };
		}
	}

	cleanupClient(client: Socket): void {
		const	sessions = this.clientSessions.get(client.id) ?? [];
		this.clientSessions.delete(client.id);

		for (const	session of sessions) {
			this.unregisterClient(session.matchId, client.id);
			this.notifyDisconnect(session).catch((error) => {
				this.logger.warn(
					`Erreur lors de la déconnexion du match ${session.matchId}: ${(error as Error).message}`,
				);
			});
		}

		for (const	room of client.rooms) {
			if (!room.startsWith('match:'))
				continue;

			const	matchId = room.replace('match:', '');
			this.unregisterClient(matchId, client.id);
		}
	}

	private emitState(matchId: string, state: PongState): void {
		if (!this.server) {
			this.logger.error('Socket server non initialisé pour PongExchangeService');
			return;
		}

		this.server.to(this.getRoom(matchId)).emit('pong:state', state);
	}

	private getRoom(matchId: string): string {
		return `match:${matchId}`;
	}

	private registerClient(matchId: string, socketId: string): void {
		const	tracker =
			this.matchTrackers.get(matchId) ??
			({ sockets: new Set() } as MatchTracker);

		tracker.sockets.add(socketId);
		this.matchTrackers.set(matchId, tracker);
	}

	private unregisterClient(matchId: string, socketId: string): void {
		const	tracker = this.matchTrackers.get(matchId);

		if (!tracker) {
			return;
		}

		tracker.sockets.delete(socketId);

		if (tracker.sockets.size === 0) {
			if (tracker.interval) {
				clearInterval(tracker.interval);
			}

			this.matchTrackers.delete(matchId);
		}
	}

	private registerClientSession(socketId: string, matchId: string, player: string): void {
		const	sessions =
			this.clientSessions.get(socketId) ??
			([] as Array<{ matchId: string; player: string }>);

		if (!sessions.find((session) => session.matchId === matchId && session.player === player))
			sessions.push({ matchId, player });

		this.clientSessions.set(socketId, sessions);
	}

	private startPolling(matchId: string): void {
		const	tracker =
			this.matchTrackers.get(matchId) ??
			({ sockets: new Set() } as MatchTracker);

		if (tracker.interval) {
			return;
		}

		// Polling à 60fps pour récupérer l'état du moteur de jeu
		tracker.interval = setInterval(async () => {
			try {
				const	state = await this.getJson<PongState>(
					`/pong/matches/${matchId}/state`,
				);

				this.emitState(matchId, state);
			} catch (error) {
				// Si le match n'existe plus côté moteur, on arrête le polling
				this.logger.warn(`Polling match ${matchId} échoué: ${(error as Error).message}`);
				const t = this.matchTrackers.get(matchId);
				if (t && t.interval) clearInterval(t.interval);
				this.matchTrackers.delete(matchId);
			}
		}, 1000 / 60);

		this.matchTrackers.set(matchId, tracker);
	}

	private async notifyDisconnect(session: { matchId: string; player: string }): Promise<DisconnectResult> {
		return this.postJson<DisconnectResult>(
			`/pong/matches/${session.matchId}/disconnect`,
			{ player: session.player },
		);
	}

	private async postJson<T>(path: string, body: object): Promise<T> {
		if (!this.fetcher) {
			throw new Error('fetch indisponible côté gateway');
		}

		const	response = await this.fetcher(`${this.gamesBaseUrl}${path}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const	details = await response.text();
			throw new Error(details || 'Requête échouée');
		}

		return (await response.json()) as T;
	}

	private async getJson<T>(path: string): Promise<T> {
		if (!this.fetcher) {
			throw new Error('fetch indisponible côté gateway');
		}

		const	response = await this.fetcher(`${this.gamesBaseUrl}${path}`);

		if (!response.ok) {
			const	details = await response.text();
			throw new Error(details || 'Requête échouée');
		}

		return (await response.json()) as T;
	}
}