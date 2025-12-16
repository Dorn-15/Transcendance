import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PongService } from './pong.service';
import type {
	PongState,
	MatchJoin,
	DisconnectResult,
} from '@transcendance/pong';

@Controller('pong')
export class PongController {
	constructor(private readonly	pongService: PongService) {}

	@Post('matches')
	createMatch(
		@Body() body: { player: string },
	): MatchJoin {
		const	match = this.pongService.createMatch(body?.player ?? 'player');

		return {
			matchId: match.id,
			state: match.state,
			players: match.players,
		};
	}

	@Post('matches/join')
	joinAny(
		@Body() body: { player: string; matchId?: string },
	): MatchJoin {
		const	match = this.pongService.joinMatch(body?.matchId, body?.player ?? 'player');

		return {
			matchId: match.id,
			state: match.state,
			players: match.players,
		};
	}

	@Post('matches/:matchId/join')
	joinMatch(
		@Param('matchId') matchId: string,
		@Body() body: { player: string },
	): MatchJoin {
		const	match = this.pongService.joinMatch(matchId, body?.player ?? 'player');

		return {
			matchId: match.id,
			state: match.state,
			players: match.players,
		};
	}

	@Post('matches/:matchId/input')
	input(
		@Param('matchId') matchId: string,
		@Body() body: { player: string; direction: 'up' | 'down' | 'none' },
	): PongState {
		return this.pongService.applyInput(
			matchId,
			body?.player ?? 'player',
			body?.direction ?? 'none',
		);
	}

	@Post('matches/:matchId/disconnect')
	disconnect(
		@Param('matchId') matchId: string,
		@Body() body: { player: string },
	): DisconnectResult {
		return this.pongService.disconnectPlayer(matchId, body?.player ?? 'player');
	}

	@Get('matches/:matchId/state')
	getState(@Param('matchId') matchId: string): PongState {
		return this.pongService.getState(matchId);
	}
}
