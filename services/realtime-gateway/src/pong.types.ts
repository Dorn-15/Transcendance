export type PongDirection = 'up' | 'down' | 'none';

export type PongStatus = 'waiting' | 'running' | 'ended';

export interface PongPlayer {
	id: string;
	side: 'left' | 'right';
}

export interface PongState {
	matchId: string;
	status: PongStatus;
	width: number;
	height: number;
	paddleHeight: number;
	ballX: number;
	ballY: number;
	ballVX: number;
	ballVY: number;
	leftY: number;
	rightY: number;
	scoreLeft: number;
	scoreRight: number;
	lastUpdate: number;
}

export interface PongMatch {
	id: string;
	players: PongPlayer[];
	state: PongState;
}

export interface MatchJoin {
	matchId: string;
	state: PongState;
	players: Array<{ id: string; side: 'left' | 'right' }>;
}
