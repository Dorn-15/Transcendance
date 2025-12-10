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
import type { PongDirection, PongState, MatchJoin } from './pong.types';
import { PongExchangeService } from './pong';

@WebSocketGateway({
	cors: {
		origin: '*',
	},
	transports: ['websocket'],
})
export class GatewayService
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	private readonly	server: Server;

	private readonly	logger = new Logger('GatewayService');

	constructor(
		private readonly	pongExchange: PongExchangeService,
	) {}

	afterInit(): void {
		this.logger.log('Gateway prêt');
		this.pongExchange.setServer(this.server);
	}

	handleConnection(client: Socket): void {
		this.logger.log(`Client ${client.id} connecté`);
	}

	handleDisconnect(client: Socket): void {
		this.logger.log(`Client ${client.id} déconnecté`);
		this.pongExchange.cleanupClient(client);
	}

	@SubscribeMessage('pong:create')
	async createMatch(
		@ConnectedSocket() client: Socket,
		@MessageBody()
		payload: { player: string },
	): Promise<MatchJoin | { error: string }> {
		return this.pongExchange.handleCreateMatch(client, payload);
	}

	@SubscribeMessage('pong:join')
	async joinMatch(
		@ConnectedSocket() client: Socket,
		@MessageBody()
		payload: { matchId: string; player: string },
	): Promise<MatchJoin | { error: string }> {
		return this.pongExchange.handleJoinMatch(client, payload);
	}

	@SubscribeMessage('pong:move')
	async move(
		@ConnectedSocket() client: Socket,
		@MessageBody()
		payload: { matchId: string; player: string; direction: PongDirection },
	): Promise<{ state?: PongState; error?: string }> {
		return this.pongExchange.handleMove(client, payload);
	}
}

