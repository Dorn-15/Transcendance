import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import type { IncomingMessage } from 'http';
import type { PongDirection, PongState, MatchJoin } from './pong.types';
import { PongExchangeService } from './pong';
import { MetricsService } from './metrics/metrics.service';

const	COOKIE_NAME = 'pong_ws_token';
const	activeTokens = new Map<string, string>();

function	parseCookies(cookieHeader?: string): Record<string, string> {
		const	cookies: Record<string, string> = {};

		if (!cookieHeader)
			return cookies;

		const	parts = cookieHeader.split(';');
		for (const	part of parts) {
			const	[key, ...rest] = part.split('=');
			if (!key)
				continue;
			cookies[key.trim()] = rest.join('=').trim();
		}

		return cookies;
}

function	generateToken(): string {
		return Array.from({ length: 24 }, () =>
			Math.floor(Math.random() * 36).toString(36),
		).join('');
}

function	ensureRequestToken(req: IncomingMessage): string {
		const	cookies = parseCookies(req.headers.cookie);
		let	token = cookies[COOKIE_NAME];

		if (!token)
			token = generateToken();

		(req as any)._pongToken = token;
		return token;
}

function	readSocketToken(client: Socket): string | null {
		const	fromRequest = (client.request as any)?._pongToken as string | undefined;
		if (fromRequest)
			return fromRequest;

		const	cookies = parseCookies(client.handshake.headers.cookie);
		return cookies[COOKIE_NAME] ?? null;
}

@WebSocketGateway({
	cors: {
		origin: '*',
		credentials: true,
	},
	transports: ['websocket'],
	allowRequest: (req, callback): void => {
		const	token = ensureRequestToken(req);
		const	existing = activeTokens.get(token);

		if (existing) {
			callback('TOO_MANY_CONNECTIONS', false);
			return;
		}

		activeTokens.set(token, 'pending');
		setTimeout(() => {
			if (activeTokens.get(token) === 'pending')
				activeTokens.delete(token);
		}, 10000);
		callback(null, true);
	},
})
export class GatewayService
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	private readonly	server: Server;

	private readonly	logger = new Logger('GatewayService');

	constructor(
		private readonly	pongExchange: PongExchangeService,
		private readonly	metricsService: MetricsService,
	) {}

	afterInit(): void {
		this.logger.log('Gateway prêt');
		this.pongExchange.setServer(this.server);
		this.server.engine.on('initial_headers', (headers, req): void => {
			const	token = ensureRequestToken(req);
			headers['Set-Cookie'] = `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax`;
		});
	}

	handleConnection(client: Socket): void {
		this.logger.log(`Client ${client.id} connecté`);
		const	token = readSocketToken(client);
		if (token)
			activeTokens.set(token, client.id);
		
		// Track WebSocket connection metrics
		this.metricsService.incrementWebSocketConnections();
	}

	handleDisconnect(client: Socket): void {
		this.logger.log(`Client ${client.id} déconnecté`);
		const	token = readSocketToken(client);
		if (token && activeTokens.get(token) === client.id)
			activeTokens.delete(token);
		this.pongExchange.cleanupClient(client);
		
		this.metricsService.decrementWebSocketConnections();
	}

	@SubscribeMessage('pong:create')
	async createMatch(
		@ConnectedSocket() client: Socket,
		@MessageBody()
		payload: { player: string },
	): Promise<MatchJoin | { error: string }> {
		const startTime = Date.now();
		this.metricsService.incrementWebSocketMessages('pong:create');
		
		try {
			const result = await this.pongExchange.handleCreateMatch(client, payload);
			const duration = (Date.now() - startTime) / 1000;
			this.metricsService.recordWebSocketMessageDuration('pong:create', duration);
			return result;
		} catch (error) {
			const duration = (Date.now() - startTime) / 1000;
			this.metricsService.recordWebSocketMessageDuration('pong:create', duration);
			throw error;
		}
	}

	@SubscribeMessage('pong:join')
	async joinMatch(
		@ConnectedSocket() client: Socket,
		@MessageBody()
		payload: { matchId?: string; player: string },
	): Promise<MatchJoin | { error: string }> {
		const startTime = Date.now();
		this.metricsService.incrementWebSocketMessages('pong:join');
		
		try {
			const result = await this.pongExchange.handleJoinMatch(client, payload);
			const duration = (Date.now() - startTime) / 1000;
			this.metricsService.recordWebSocketMessageDuration('pong:join', duration);
			return result;
		} catch (error) {
			const duration = (Date.now() - startTime) / 1000;
			this.metricsService.recordWebSocketMessageDuration('pong:join', duration);
			throw error;
		}
	}

	@SubscribeMessage('pong:move')
	async move(
		@ConnectedSocket() client: Socket,
		@MessageBody()
		payload: { matchId: string; player: string; direction: PongDirection },
	): Promise<{ state?: PongState; error?: string }> {
		const startTime = Date.now();
		this.metricsService.incrementWebSocketMessages('pong:move');
		
		try {
			const result = await this.pongExchange.handleMove(client, payload);
			const duration = (Date.now() - startTime) / 1000;
			this.metricsService.recordWebSocketMessageDuration('pong:move', duration);
			return result;
		} catch (error) {
			const duration = (Date.now() - startTime) / 1000;
			this.metricsService.recordWebSocketMessageDuration('pong:move', duration);
			throw error;
		}
	}
}

