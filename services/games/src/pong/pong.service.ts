import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
	OnModuleDestroy,
} from '@nestjs/common';

import type {
	PongDirection,
	PongMatch,
	PongPlayer,
	PongState,
	DisconnectResult,
} from '@transcendance/pong';

interface MatchInputs {
	left: PongDirection;
	right: PongDirection;
}

@Injectable()
export class PongService implements OnModuleDestroy {
	private readonly	matches = new Map<string, PongMatch>();
	private readonly	inputs = new Map<string, MatchInputs>();
	private readonly	restartVotes = new Map<string, Set<string>>();
	private readonly	aiPlayers = new Map<string, string>();
	private readonly	aiIntervals = new Map<string, ReturnType<typeof setInterval>>();
	private readonly	frameRateMs: number;
	private readonly	frameRateS: number;
	private readonly	tickInterval: ReturnType<typeof setInterval>;
	private readonly	speedIncrement: number;
	private readonly	maxBallSpeed: number;
	private readonly	maxBounceAngle: number;
	private readonly	aiDeadZone: number;

	constructor() {
		this.frameRateMs = 1000 / 60;
		this.frameRateS = this.frameRateMs / 1000;
		this.speedIncrement = 28;
		this.maxBallSpeed = 800;
		this.maxBounceAngle = Math.PI / 3;
		this.tickInterval = setInterval(() => this.tick(), this.frameRateMs);
		this.aiDeadZone = 45;
	}

	onModuleDestroy(): void {
		clearInterval(this.tickInterval);
		for (const	interval of this.aiIntervals.values()) {
			clearInterval(interval);
		}
		this.aiIntervals.clear();
		this.aiPlayers.clear();
	}

// Game utils =======================================================
	private createInitialState(matchId: string): PongState {
		const	width = 800;
		const	height = 600;
		const	paddleHeight = 100;
		const	paddleThickness = 16;
		const	ballSpeed = 200;

		return {
			matchId,
			status: 'waiting',
			width,
			height,
			paddleHeight,
			paddleThickness,
			ballRadius: 5,
			ballX: width / 2,
			ballY: height / 2,
			ballVX: 1,
			ballVY: 0,
			ballSpeed,
			leftY: height / 2 - paddleHeight / 2,
			rightY: height / 2 - paddleHeight / 2,
			scoreLeft: 0,
			scoreRight: 0,
			lastUpdate: Date.now(),
		};
	}

	private checkMatchId(matchId: string): PongMatch {
		if (!matchId)
			throw new BadRequestException('matchId missing');

		const	match = this.matches.get(matchId);
		if (!match)
			throw new NotFoundException('Match not found');

		return match;
	}

	private checkPlayerId(playerId: string): string {
		const	trimmedPlayerId = playerId?.trim();
		if (!trimmedPlayerId)
			throw new BadRequestException('player missing');

		return trimmedPlayerId;
	}

	private checkPlayer(match: PongMatch, playerId: string): PongPlayer {
		const	player = match.players.find((p) => p.id === playerId);
		if (!player)
			throw new NotFoundException('Player not registered');

		return player;
	}

	private findMatchByPlayer(playerId: string): PongMatch | undefined {
		for (const	match of this.matches.values()) {
			if (match.state.status === 'ended')
				continue;
			if (match.players.some((p) => p.id === playerId))
				return match;
		}
		return undefined;
	}

	private markPlayerConnected(match: PongMatch, playerId: string): void {
		const	player = match.players.find((p) => p.id === playerId);
		if (!player)
			return;

		player.connected = true;
		if (!this.inputs.has(match.id))
			this.inputs.set(match.id, { left: 'none', right: 'none' });
		this.resumeIfReady(match);
	}

	private ensureMatchInputs(matchId: string): MatchInputs {
		let	matchInputs = this.inputs.get(matchId);
		if (!matchInputs) {
			matchInputs = { left: 'none', right: 'none' };
			this.inputs.set(matchId, matchInputs);
		}
		return matchInputs;
	}

	private resumeIfReady(match: PongMatch): void {
		if (match.state.status === 'ended')
			return;
		else if (match.players.length < 2)
			match.state.status = 'waiting';
		else if (match.players.every((p) => p.connected)) {
			match.state.status = 'running';
			match.state.lastUpdate = Date.now();
		}
		else if (match.players.some((p) => p.connected))
			match.state.status = 'paused';
		else
			match.state.status = 'waiting';
	}

// AI Management =======================================================
	private stopAi(matchId: string): void {
		const	interval = this.aiIntervals.get(matchId);
		if (interval)
			clearInterval(interval);
		this.aiIntervals.delete(matchId);
		this.aiPlayers.delete(matchId);
	}
	private cumputeAiTarget(state: PongState): number {
		if (state.ballVX < 0)
			return state.height / 2;

		let	deltaY: number;
		deltaY = (Math.abs(state.ballVY) / Math.abs(state.ballVX))
			* (state.width - state.paddleThickness - state.ballX);

		let	targetY: number;
		targetY = state.ballY + (state.ballVY > 0 ? deltaY : -deltaY);
		while (targetY < 0 || targetY > state.height) {
			if (targetY < 0)
				targetY = -targetY;
			else if (targetY > state.height)
				targetY = 2 * state.height - targetY;
		}
		targetY += (Math.random() * 50) * (Math.random() > 0.5 ? 1 : -1);
		return targetY;
	}

	private computeAiDirection(state: PongState, targetY: number): PongDirection {
		const	paddleCenter = state.rightY + state.paddleHeight / 2;
		const	delta = targetY - paddleCenter;
		if (delta > this.aiDeadZone)
			return 'down';
		if (delta < -this.aiDeadZone)
			return 'up';
		return 'none';
	}

	private startAi(matchId: string): void {
		if (this.aiIntervals.has(matchId))
			return;

		let	lastBallVX: number | undefined;
		let	targetY: number;
		targetY = 0;
		const	interval = setInterval(() => {
			const	match = this.matches.get(matchId);
			if (!match) {
				this.stopAi(matchId);
				return;
			}
			else if (match.state.status === 'ended' || match.state.status !== 'running') {
				this.ensureMatchInputs(matchId).right = 'none';
				return;
			}

			if (lastBallVX === undefined || lastBallVX !== match.state.ballVX) {
				lastBallVX = match.state.ballVX;
				targetY = this.cumputeAiTarget(match.state);
			}

			this.ensureMatchInputs(matchId).right = this.computeAiDirection(match.state, targetY);
		}, 1000 / 5);

		this.aiIntervals.set(matchId, interval);
	}

// Game Management =======================================================
	createMatch(playerId: string): PongMatch {
		const	trimmedPlayerId = this.checkPlayerId(playerId);
		const	existingMatch = this.findMatchByPlayer(trimmedPlayerId);
		if (existingMatch) {
			this.markPlayerConnected(existingMatch, trimmedPlayerId);
			return existingMatch;
		}

		let	matchId: string;
		do {
			matchId = 'P' + Array.from({ length: 5 }, () =>
				String.fromCharCode(65 + Math.floor(Math.random() * 26)),
			).join('');
		} while (this.matches.has(matchId));

		let	state: PongState;
		state = this.createInitialState(matchId);

		let	players: PongPlayer[];
		players = [
			{
				id: trimmedPlayerId,
				side: 'left',
				connected: true,
			},
		];

		let	match: PongMatch;
		match = {
			id: matchId,
			players,
			state,
		};
		this.matches.set(matchId, match);
		this.inputs.set(matchId, { left: 'none', right: 'none' });
		return match;
	}

	createSoloMatch(playerId: string): PongMatch {
		const	trimmedPlayerId = this.checkPlayerId(playerId);
		const	existingMatch = this.findMatchByPlayer(trimmedPlayerId);
		if (existingMatch) {
			this.markPlayerConnected(existingMatch, trimmedPlayerId);
			return existingMatch;
		}

		let	matchId: string;
		do {
			matchId = 'P' + Array.from({ length: 5 }, () =>
				String.fromCharCode(65 + Math.floor(Math.random() * 26)),
			).join('');
		} while (this.matches.has(matchId));

		let	state: PongState;
		state = this.createInitialState(matchId);

		const	aiPlayerId = `AI:${matchId}`;

		let	players: PongPlayer[];
		players = [
			{
				id: trimmedPlayerId,
				side: 'left',
				connected: true,
			},
			{
				id: aiPlayerId,
				side: 'right',
				connected: true,
			},
		];

		let	match: PongMatch;
		match = {
			id: matchId,
			players,
			state,
		};

		this.matches.set(matchId, match);
		this.inputs.set(matchId, { left: 'none', right: 'none' });
		this.aiPlayers.set(matchId, aiPlayerId);
		this.resumeIfReady(match);
		this.startAi(matchId);
		return match;
	}

	joinMatch(matchId: string, playerId: string): PongMatch {
		const	trimmedPlayerId = this.checkPlayerId(playerId);
		const	existingMatch = this.findMatchByPlayer(trimmedPlayerId);
		if (existingMatch) {
			this.markPlayerConnected(existingMatch, trimmedPlayerId);
			return existingMatch;
		}

		const	match = this.checkMatchId(matchId);
		const	alreadyInMatch = match.players.find((p) => p.id === trimmedPlayerId);
		if (alreadyInMatch) {
			this.markPlayerConnected(match, trimmedPlayerId);
			return match;
		}
		if (match.state.status === 'ended')
			throw new ConflictException('Match ended');
		if (match.players.length >= 2)
			throw new ConflictException('Match full');

		match.players.push({
			id: trimmedPlayerId,
			side: 'right',
			connected: true,
		});
		if (!this.inputs.has(matchId))
			this.inputs.set(matchId, { left: 'none', right: 'none' });
		this.resumeIfReady(match);
		return match;
	}

	getState(matchId: string): PongState {
		const match = this.checkMatchId(matchId);
		return match.state;
	}

	applyInput(matchId: string, playerId: string, direction: PongDirection): PongState {
		const	trimmedPlayerId = this.checkPlayerId(playerId);
		const	match = this.checkMatchId(matchId);
		const	player = this.checkPlayer(match, trimmedPlayerId);

		if (match.state.status !== 'running')
			return match.state;

		let	matchInputs = this.ensureMatchInputs(matchId);
		if (player.side === 'left')
			matchInputs.left = direction;
		else
			matchInputs.right = direction;
		return match.state;
	}

	disconnectPlayer(matchId: string, playerId: string): DisconnectResult {
		const	trimmedPlayerId = this.checkPlayerId(playerId);
		const	match = this.checkMatchId(matchId);
		const	player = this.checkPlayer(match, trimmedPlayerId);

		player.connected = false;
		this.restartVotes.delete(matchId);
		if (match.state.status !== 'ended')
			match.state.status = 'paused';

		const	aiPlayerId = this.aiPlayers.get(matchId);
		if (aiPlayerId) {
			const	humansDisconnected = match.players
				.filter((p) => p.id !== aiPlayerId)
				.every((p) => !p.connected);
			if (humansDisconnected) {
				this.stopAi(matchId);
				this.matches.delete(matchId);
				this.inputs.delete(matchId);
				this.restartVotes.delete(matchId);
				return {
					matchId,
					removed: true,
				};
			}
		}

		const	allDisconnected = match.players.every((p) => !p.connected);
		if (allDisconnected) {
			this.stopAi(matchId);
			this.matches.delete(matchId);
			this.inputs.delete(matchId);
			this.restartVotes.delete(matchId);
			return {
				matchId,
				removed: true,
			};
		}

		return {
			matchId,
			removed: false,
			state: match.state,
			players: match.players,
		};
	}

	restartMatch(matchId: string, playerId: string): PongState {
		const	trimmedPlayerId = this.checkPlayerId(playerId);
		const	match = this.checkMatchId(matchId);
		this.checkPlayer(match, trimmedPlayerId);
		if (match.state.status !== 'ended')
			throw new ConflictException('Match not ended');

		let	votes: Set<string> | undefined;
		votes = this.restartVotes.get(matchId);
		if (!votes) {
			votes = new Set<string>();
			this.restartVotes.set(matchId, votes);
		}
		votes.add(trimmedPlayerId);

		if (votes.size < 2)
			return match.state;

		match.state = this.createInitialState(matchId);
		this.inputs.set(matchId, { left: 'none', right: 'none' });
		this.restartVotes.delete(matchId);
		this.resumeIfReady(match);
		return match.state;
	}

	closeMatch(matchId: string): { matchId: string; removed: boolean } {
		const	exists = this.matches.has(matchId);
		if (!exists)
			return { matchId, removed: false };

		this.stopAi(matchId);
		this.matches.delete(matchId);
		this.inputs.delete(matchId);
		this.restartVotes.delete(matchId);
		return { matchId, removed: true };
	}

// Game Logic ============================================================
	private clamp(value: number, min: number, max: number): number {
		return Math.max(min, Math.min(max, value));
	}

	private computePaddleShift(direction: PongDirection): number {
		let	speed: number;
		speed = 420;

		let	shift: number;
		if (direction === 'up')
			shift = -speed * this.frameRateS;
		else if (direction === 'down')
			shift = speed * this.frameRateS;
		else
			shift = 0;
		return shift;
	}

	private applyQueuedInputs(match: PongMatch): void {
		let	inputs: MatchInputs | undefined;
		inputs = this.inputs.get(match.id);
		if (!inputs)
			return;

		let	shift: number;
		shift = this.computePaddleShift(inputs.left);
		match.state.leftY = this.clamp(
			match.state.leftY + shift,
			0,
			match.state.height - match.state.paddleHeight,
		);

		shift = this.computePaddleShift(inputs.right);
		match.state.rightY = this.clamp(
			match.state.rightY + shift,
			0,
			match.state.height - match.state.paddleHeight,
		);
	}

	private handlePaddleBounce(state: PongState, paddleX: number, paddleY: number): void {
		const	ballRadius = state.ballRadius;

		if (state.ballVX < 0) {
			if (state.ballX - ballRadius > paddleX)
				return;
		} else if (state.ballVX > 0) {
			if (state.ballX + ballRadius < paddleX)
				return;
		} else {
			return;
		}

		if (state.ballY + ballRadius < paddleY || state.ballY - ballRadius > paddleY + state.paddleHeight)
			return;

		let	penetration: number;
		if (state.ballVX < 0) {
			penetration = paddleX - (state.ballX - ballRadius);
			if (penetration > 0)
				state.ballX += penetration * 2;
		} else {
			penetration = (state.ballX + ballRadius) - paddleX;
			if (penetration > 0)
				state.ballX -= penetration * 2;
		}

		let	relativeIntersectY: number;
		relativeIntersectY = (state.ballY - (paddleY + state.paddleHeight / 2)) / (state.paddleHeight / 2);
		relativeIntersectY = this.clamp(relativeIntersectY, -1, 1);

		const	bounceAngle = relativeIntersectY * this.maxBounceAngle;
		const	direction = state.ballVX < 0 ? 1 : -1;

		if (state.ballSpeed < this.maxBallSpeed)
			state.ballSpeed += this.speedIncrement;
		state.ballVX = Math.cos(bounceAngle) * direction;
		state.ballVY = Math.sin(bounceAngle);
	}

	private resetBall(state: PongState, direction: -1 | 1): void {
		const	ballSpeed = 200;

		state.ballX = state.width / 2;
		state.ballY = state.height / 2;
		state.ballVX = 1 * direction;
		state.ballVY = 0;
		state.ballSpeed = ballSpeed;
		state.leftY = state.height / 2 - state.paddleHeight / 2;
		state.rightY = state.height / 2 - state.paddleHeight / 2;
		state.lastUpdate = Date.now();
	}

	private updatePhysics(match: PongMatch, delta: number): void {
		const	state = match.state;

		state.ballX += state.ballVX * state.ballSpeed * delta;
		state.ballY += state.ballVY * state.ballSpeed * delta;
		if (state.ballY <= state.ballRadius || state.ballY >= state.height - state.ballRadius) {
			state.ballVY = -state.ballVY;
			if (state.ballY <= state.ballRadius)
				state.ballY = state.ballRadius + (state.ballRadius - state.ballY);
			else
				state.ballY = state.height - state.ballRadius - (state.ballY - (state.height - state.ballRadius));
		}

		if (state.ballVX < 0) {
			this.handlePaddleBounce(state, state.paddleThickness, state.leftY);
		} else {
			this.handlePaddleBounce(state, (state.width - state.paddleThickness), state.rightY);
		}

		if (state.ballX < 0) {
			state.scoreRight += 1;
			this.resetBall(state, -1);
		} else if (state.ballX > state.width) {
			state.scoreLeft += 1;
			this.resetBall(state, 1);
		}

		if (state.scoreLeft >= 5 || state.scoreRight >= 5) {
			state.status = 'ended';
		}
	}

	private tick(): void {
		const	now = Date.now();

		for (const	[matchId, match] of this.matches.entries()) {
			if (match.state.status === 'ended' && match.players.every((p) => !p.connected)) {
				this.stopAi(matchId);
				this.matches.delete(matchId);
				this.inputs.delete(matchId);
				continue;
			}

			if (match.state.status !== 'running')
				continue;
			this.applyQueuedInputs(match);
			this.updatePhysics(match, this.frameRateS);
			match.state.lastUpdate = now;
		}
	}
}
