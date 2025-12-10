import { Injectable, OnModuleDestroy } from '@nestjs/common';
import {
	PongDirection,
	PongMatch,
	PongPlayer,
	PongState,
} from './pong.types';

interface MatchInputs {
	left: PongDirection;
	right: PongDirection;
}

@Injectable()
export class PongService implements OnModuleDestroy {
	private readonly	matches = new Map<string, PongMatch>();
	private readonly	inputs = new Map<string, MatchInputs>();
	private readonly	frameDurationMs: number;
	private readonly	frameDurationSeconds: number;
	private readonly	tickInterval: NodeJS.Timeout;

	constructor() {
		let	frameDurationMs: number;
		frameDurationMs = 1000 / 60;

		let	frameDurationSeconds: number;
		frameDurationSeconds = frameDurationMs / 1000;

		this.frameDurationMs = frameDurationMs;
		this.frameDurationSeconds = frameDurationSeconds;
		this.tickInterval = setInterval(() => {
			this.tick();
		}, frameDurationMs);
	}

	createMatch(playerId: string): PongMatch {
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
				id: playerId,
				side: 'left',
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

	joinMatch(matchId: string, playerId: string): PongMatch {
		const	match = this.matches.get(matchId);
		if (!match)
			throw new Error('Match introuvable');
		else if (match.players.length >= 2)
			throw new Error('Match complet');
		else if (match.players.find((p) => p.id === playerId))
			return match;

		match.players.push({
			id: playerId,
			side: 'right',
		});
		if (!this.inputs.has(matchId))
			this.inputs.set(matchId, { left: 'none', right: 'none' });
		match.state.status = 'running';
		match.state.lastUpdate = Date.now();
		return match;
	}

	getState(matchId: string): PongState {
		const	match = this.matches.get(matchId);
		if (!match)
			throw new Error('Match introuvable');

		return match.state;
	}

	applyInput(matchId: string, playerId: string, direction: PongDirection): PongState {
		const	match =
			this.matches.get(matchId);
		if (!match)
			throw new Error('Match introuvable');
		const	player =
			match.players.find((p) => p.id === playerId);
		if (!player) {
			throw new Error('Joueur non inscrit');
		}

		let	matchInputs: MatchInputs | undefined;
		matchInputs = this.inputs.get(matchId);
		if (!matchInputs) {
			matchInputs = { left: 'none', right: 'none' };
			this.inputs.set(matchId, matchInputs);
		}

		if (player.side === 'left')
			matchInputs.left = direction;
		else
			matchInputs.right = direction;
		return match.state;
	}

	onModuleDestroy(): void {
		clearInterval(this.tickInterval);
	}

	private tick(): void {
		const	now = Date.now();

		this.matches.forEach((match) => {
			if (match.state.status !== 'running')
				return;
			this.applyQueuedInputs(match);
			this.updatePhysics(match, this.frameDurationSeconds);
			match.state.lastUpdate = now;
		});
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

	private computePaddleShift(direction: PongDirection): number {
		let	speed: number;
		speed = 420;

		let	shift: number;
		if (direction === 'up')
			shift = -speed * this.frameDurationSeconds;
		else if (direction === 'down')
			shift = speed * this.frameDurationSeconds;
		else
			shift = 0;
		return shift;
	}

	private updatePhysics(match: PongMatch, delta: number): void {
		const	state =
			match.state;

		state.ballX += state.ballVX * delta;
		state.ballY += state.ballVY * delta;

		// Rebond haut / bas
		if (state.ballY <= 0 || state.ballY >= state.height) {
			state.ballVY = -state.ballVY;
			if (state.ballY <= 0)
				state.ballY = - state.ballY;
			else
				state.ballY = state.height - (state.ballY - state.height);
		}

		// Collision raquette gauche
		if (
			state.ballX <= 16 &&
			state.ballY >= state.leftY &&
			state.ballY <= state.leftY + state.paddleHeight
		) {
			state.ballX = 16 - (state.ballX - 16);
			state.ballVX = Math.abs(state.ballVX);
		}

		// Collision raquette droite
		if (
			state.ballX >= state.width - 16 &&
			state.ballY >= state.rightY &&
			state.ballY <= state.rightY + state.paddleHeight
		) {
			state.ballX = state.width - 16 + (state.ballX - (state.width - 16));
			state.ballVX = -Math.abs(state.ballVX);
		}

		// Point marqué
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

	private resetBall(state: PongState, direction: -1 | 1): void {
		state.ballX = state.width / 2;
		state.ballY = state.height / 2;
		state.ballVX = 160 * direction;
		state.ballVY = 120 * (Math.random() > 0.5 ? 1 : -1);
		state.lastUpdate = Date.now();
	}

	private createInitialState(matchId: string): PongState {
		const	width =
			800;
		const	height =
			600;
		const	paddleHeight =
			120;
		return {
			matchId,
			status: 'waiting',
			width,
			height,
			paddleHeight,
			ballX: width / 2,
			ballY: height / 2,
			ballVX: 160,
			ballVY: 120,
			leftY: height / 2 - paddleHeight / 2,
			rightY: height / 2 - paddleHeight / 2,
			scoreLeft: 0,
			scoreRight: 0,
			lastUpdate: Date.now(),
		};
	}

	private clamp(value: number, min: number, max: number): number {
		return Math.max(min, Math.min(max, value));
	}
}

