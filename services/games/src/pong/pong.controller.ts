import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PongService } from './pong.service';
import type {
	PongDirection,
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
		const	player = body?.player?.trim();
		if (!player)
			throw new BadRequestException('player missing');

		const	match = this.pongService.createMatch(player);

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
		const	player = body?.player?.trim();
		if (!player)
			throw new BadRequestException('player missing');

		const	match = this.pongService.joinMatch(matchId, player);

		return {
			matchId: match.id,
			state: match.state,
			players: match.players,
		};
	}

	@Post('matches/:matchId/input')
	input(
		@Param('matchId') matchId: string,
		@Body() body: { player: string; direction: PongDirection },
	): PongState {
		const	player = body?.player?.trim();
		if (!player)
			throw new BadRequestException('player missing');

		const	direction = body?.direction ?? 'none';
		if (direction !== 'up' && direction !== 'down' && direction !== 'none')
			throw new BadRequestException('invalid direction');

		return this.pongService.applyInput(
			matchId,
			player,
			direction,
		);
	}

	@Post('matches/:matchId/disconnect')
	disconnect(
		@Param('matchId') matchId: string,
		@Body() body: { player: string },
	): DisconnectResult {
		const	player = body?.player?.trim();
		if (!player)
			throw new BadRequestException('player missing');

		return this.pongService.disconnectPlayer(matchId, player);
	}

	@Get('matches/:matchId/state')
	getState(@Param('matchId') matchId: string): PongState {
		return this.pongService.getState(matchId);
	}
}
