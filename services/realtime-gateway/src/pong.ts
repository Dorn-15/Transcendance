import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import type { MatchJoin, PongDirection, PongState } from './pong.types';

interface MatchTracker {
	sockets: Set<string>;
	interval?: NodeJS.Timeout;
}

@Injectable()
export class PongExchangeService {
	private readonly	logger = new Logger('PongExchangeService');
	private			server: Server | null = null;
	private readonly	matchTrackers = new Map<string, MatchTracker>();
	private readonly	gamesBaseUrl =
		process.env.GAMES_BASE_URL ?? process.env.GAME_HOST ?? 'http://game_service:4005';
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
		payload: { matchId: string; player: string },
	): Promise<MatchJoin | { error: string }> {
		try {
			const	body = {
				player: payload?.player ?? 'player',
			};
			const	path = `/pong/matches/${payload.matchId}/join`;
			const	response = await this.postJson<MatchJoin>(path, body);

			await client.join(this.getRoom(response.matchId));
			this.registerClient(response.matchId, client.id);
			this.startPolling(response.matchId);

			this.emitState(response.matchId, response.state);

			return response;
		} catch (error) {
			const	message = (error as Error).message;
			this.logger.error(message);
			return { error: message };
		}
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
		for (const	room of client.rooms) {
			if (!room.startsWith('match:')) {
				continue;
			}

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

	private startPolling(matchId: string): void {
		const	tracker =
			this.matchTrackers.get(matchId) ??
			({ sockets: new Set() } as MatchTracker);

		if (tracker.interval) {
			return;
		}

		tracker.interval = setInterval(async () => {
			try {
				const	state = await this.getJson<PongState>(
					`/pong/matches/${matchId}/state`,
				);

				this.emitState(matchId, state);
			} catch (error) {
				this.logger.warn(
					`Polling match ${matchId} échoué: ${(error as Error).message}`,
				);
			}
		}, 1000 / 60);

		this.matchTrackers.set(matchId, tracker);
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


