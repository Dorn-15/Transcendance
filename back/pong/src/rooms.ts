import { randomBytes } from 'crypto';
export interface LiveSocket {
	readyState: number;
	send: (data: string) => void;
	on: (event: 'message' | 'close', listener: (data: Buffer) => void) => void;
	close: () => void;
}

export type RoomId = string;

type Seat = 'left' | 'right';

export interface ClientProfile {
	id: string;
	name?: string;
	avatar?: string;
}

interface PlayerSlot {
	seat: Seat;
	profile: ClientProfile;
	paddleY: number;
	score: number;
	socket: LiveSocket | null;
	lastSeen: number;
}

interface ViewerSlot {
	profile: ClientProfile;
	socket: LiveSocket;
}

interface GameState {
	width: number;
	height: number;
	ballX: number;
	ballY: number;
	velX: number;
	velY: number;
	ballSpeed: number;
	paddleHeight: number;
	paddleWidth: number;
	status: 'waiting' | 'running';
}

export interface PublicParticipant {
	id: string;
	name?: string;
	avatar?: string;
	paddleY?: number;
}

export interface PublicRoom {
	id: RoomId;
	createdAt: string;
	players: {
		left: PublicParticipant | null;
		right: PublicParticipant | null;
	};
	viewers: PublicParticipant[];
	state: {
		ballX: number;
		ballY: number;
		velX: number;
		velY: number;
		width: number;
		height: number;
		paddleHeight: number;
		paddleWidth: number;
		status: 'waiting' | 'running';
		leftScore: number;
		rightScore: number;
	};
}

interface Room {
	id: RoomId;
	createdAt: string;
	players: {
		left: PlayerSlot | null;
		right: PlayerSlot | null;
	};
	viewers: Map<string, ViewerSlot>;
	game: GameState;
	tick?: NodeJS.Timeout | null;
	lastTick: number;
}

const	roomIdLength
= 6;

const	websocketOpenState
= 1;

const	defaultGameState
: GameState
= {
	width: 800,
	height: 480,
	ballX: 400,
	ballY: 240,
	velX: 180,
	velY: 120,
	ballSpeed: 240,
	paddleHeight: 90,
	paddleWidth: 12,
	status: 'waiting'
};

let	roomsStore
: Map<RoomId, Room> | null
= null;

const	nowMs
= (): number => Date.now();

const	cloneDefaultGame
= (): GameState => ({
	width: defaultGameState.width,
	height: defaultGameState.height,
	ballX: defaultGameState.ballX,
	ballY: defaultGameState.ballY,
	velX: defaultGameState.velX,
	velY: defaultGameState.velY,
	ballSpeed: defaultGameState.ballSpeed,
	paddleHeight: defaultGameState.paddleHeight,
	paddleWidth: defaultGameState.paddleWidth,
	status: defaultGameState.status
});

const	generateRoomId
= (): RoomId => {
	const	alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let	value = 'P';
	while (value.length < roomIdLength) {
		const	index = randomBytes(1)[0] % alphabet.length;
		value += alphabet[index];
	}
	return	value;
};

const	ensureStore
= (): Map<RoomId, Room> => {
	if (roomsStore === null) {
		throw new Error('Rooms store is not initialized');
	}
	return	roomsStore;
};

const	createRoomState
= (): Room => ({
	id: generateRoomId(),
	createdAt: new Date().toISOString(),
	players: {
		left: null,
		right: null
	},
	viewers: new Map<string, ViewerSlot>(),
	game: cloneDefaultGame(),
	tick: null,
	lastTick: nowMs()
});

const	buildParticipant
= (slot: PlayerSlot | null): PublicParticipant | null => {
	if (slot === null) {
		return	null;
	}
	return	{
		id: slot.profile.id,
		name: slot.profile.name,
		avatar: slot.profile.avatar,
		paddleY: slot.paddleY
	};
};

const	buildPublicRoom
= (room: Room): PublicRoom => ({
	id: room.id,
	createdAt: room.createdAt,
	players: {
		left: buildParticipant(room.players.left),
		right: buildParticipant(room.players.right)
	},
	viewers: Array.from(room.viewers.values()).map((viewer) => ({
		id: viewer.profile.id,
		name: viewer.profile.name,
		avatar: viewer.profile.avatar
	})),
	state: {
		ballX: room.game.ballX,
		ballY: room.game.ballY,
		velX: room.game.velX,
		velY: room.game.velY,
		width: room.game.width,
		height: room.game.height,
		paddleHeight: room.game.paddleHeight,
		paddleWidth: room.game.paddleWidth,
		status: room.game.status,
		leftScore: room.players.left?.score ?? 0,
		rightScore: room.players.right?.score ?? 0
	}
});

const	sendSafe
= (socket: LiveSocket | null, payload: unknown): void => {
	if (socket === null) {
		return;
	}
	if (socket.readyState !== websocketOpenState) {
		return;
	}
	socket.send(JSON.stringify(payload));
};

const	broadcastState
= (room: Room): void => {
	const	snapshot = buildPublicRoom(room);
	const	message = { type: 'state', payload: snapshot };
	sendSafe(room.players.left?.socket ?? null, message);
	sendSafe(room.players.right?.socket ?? null, message);
	room.viewers.forEach((viewer) => sendSafe(viewer.socket, message));
};

const	resetBall
= (room: Room): void => {
	room.game.ballX = room.game.width / 2;
	room.game.ballY = room.game.height / 2;
	room.game.velX = Math.random() > 0.5 ? room.game.ballSpeed : -room.game.ballSpeed;
	room.game.velY = (Math.random() * room.game.ballSpeed) / 2 * (Math.random() > 0.5 ? 1 : -1);
};

const	stopLoop
= (room: Room): void => {
	if (room.tick !== null) {
		clearInterval(room.tick);
		room.tick = null;
	}
	room.game.status = 'waiting';
};

const	startLoop
= (room: Room): void => {
	if (room.tick !== null) {
		return;
	}
	if (room.players.left === null || room.players.right === null) {
		return;
	}
	if (room.players.left.socket === null || room.players.right.socket === null) {
		return;
	}
	resetBall(room);
	room.game.status = 'running';
	room.lastTick = nowMs();
	room.tick = setInterval(() => {
		tickRoom(room);
	}, 1000 / 60);
};

const	handleWallBounces
= (room: Room): void => {
	const	nextTop = room.game.ballY - 6;
	const	nextBottom = room.game.ballY + 6;
	if (nextTop <= 0 && room.game.velY < 0) {
		room.game.velY *= -1;
	}
	if (nextBottom >= room.game.height && room.game.velY > 0) {
		room.game.velY *= -1;
	}
};

const	handlePaddleBounce
= (room: Room, player: PlayerSlot, isLeft: boolean): boolean => {
	const	paddleX = isLeft ? 24 : room.game.width - 24 - room.game.paddleWidth;
	const	paddleTop = player.paddleY - room.game.paddleHeight / 2;
	const	paddleBottom = player.paddleY + room.game.paddleHeight / 2;
	const	ballLeft = room.game.ballX - 6;
	const	ballRight = room.game.ballX + 6;
	if (isLeft && ballLeft <= paddleX + room.game.paddleWidth && room.game.ballY >= paddleTop && room.game.ballY <= paddleBottom && room.game.velX < 0) {
		room.game.velX = Math.abs(room.game.velX);
		room.game.velY += ((room.game.ballY - player.paddleY) / room.game.paddleHeight) * room.game.ballSpeed * 0.3;
		return	true;
	}
	if (!isLeft && ballRight >= paddleX && room.game.ballY >= paddleTop && room.game.ballY <= paddleBottom && room.game.velX > 0) {
		room.game.velX = -Math.abs(room.game.velX);
		room.game.velY += ((room.game.ballY - player.paddleY) / room.game.paddleHeight) * room.game.ballSpeed * 0.3;
		return	true;
	}
	return	false;
};

const	scorePoint
= (room: Room, side: 'left' | 'right'): void => {
	if (side === 'left' && room.players.left !== null) {
		room.players.left.score += 1;
	}
	if (side === 'right' && room.players.right !== null) {
		room.players.right.score += 1;
	}
	resetBall(room);
};

const	tickRoom
= (room: Room): void => {
	const	now = nowMs();
	const	delta = (now - room.lastTick) / 1000;
	room.lastTick = now;
	room.game.ballX += room.game.velX * delta;
	room.game.ballY += room.game.velY * delta;
	handleWallBounces(room);
	if (room.players.left !== null) {
		handlePaddleBounce(room, room.players.left, true);
	}
	if (room.players.right !== null) {
		handlePaddleBounce(room, room.players.right, false);
	}
	if (room.game.ballX < 0) {
		scorePoint(room, 'right');
	}
	if (room.game.ballX > room.game.width) {
		scorePoint(room, 'left');
	}
	broadcastState(room);
};

const	onSocketClose
= (room: Room, seat: Seat | 'viewer', clientId: string): void => {
	if (seat === 'viewer') {
		room.viewers.delete(clientId);
		broadcastState(room);
		return;
	}
	const	slot = seat === 'left' ? room.players.left : room.players.right;
	if (slot !== null && slot.profile.id === clientId) {
		slot.socket = null;
		stopLoop(room);
		broadcastState(room);
	}
};

const	handlePlayerMessage
= (slot: PlayerSlot, data: string): void => {
	try {
		const	payload = JSON.parse(data) as { type?: string; y?: number };
		if (payload.type === 'move' && typeof payload.y === 'number') {
			const	target = Math.max(0, Math.min(payload.y, defaultGameState.height));
			slot.paddleY = target;
		}
	} catch {
		// ignore malformed payloads
	}
};

const	attachSocketHandlers
= (room: Room, slot: PlayerSlot | ViewerSlot, seat: Seat | 'viewer'): void => {
	if (slot.socket === null) {
		return;
	}
	slot.socket.on('message', (raw: Buffer | string) => {
		if (seat === 'viewer') {
			return;
		}
		handlePlayerMessage(slot as PlayerSlot, raw.toString());
	});
	slot.socket.on('close', () => {
		onSocketClose(room, seat, slot.profile.id);
	});
};

const	upsertPlayer
= (room: Room, seat: Seat, profile: ClientProfile, socket: LiveSocket): PlayerSlot => {
	const	existing = seat === 'left' ? room.players.left : room.players.right;
	if (existing !== null && existing.profile.id === profile.id) {
		existing.socket = socket;
		existing.lastSeen = nowMs();
		return	existing;
	}
	if (existing !== null && existing.profile.id !== profile.id) {
		throw new Error('Seat already taken by another player');
	}
	const	slot: PlayerSlot = {
		seat,
		profile,
		paddleY: defaultGameState.height / 2,
		score: 0,
		socket,
		lastSeen: nowMs()
	};
	if (seat === 'left') {
		room.players.left = slot;
	} else {
		room.players.right = slot;
	}
	return	slot;
};

const	upsertViewer
= (room: Room, profile: ClientProfile, socket: LiveSocket): ViewerSlot => {
	const	current = room.viewers.get(profile.id);
	if (current !== undefined) {
		current.socket = socket;
		current.profile = profile;
		return	current;
	}
	const	viewer: ViewerSlot = {
		profile,
		socket
	};
	room.viewers.set(profile.id, viewer);
	return	viewer;
};

export const initRoomsStore = async (): Promise<void> => {
	if (roomsStore !== null) {
		return;
	}
	roomsStore = new Map<RoomId, Room>();
};

export const closeRoomsStore = async (): Promise<void> => {
	if (roomsStore === null) {
		return;
	}
	roomsStore.forEach((room) => stopLoop(room));
	roomsStore.clear();
	roomsStore = null;
};

export const createRoom = async (_payload: unknown): Promise<PublicRoom> => {
	const	store = ensureStore();
	const	room = createRoomState();
	store.set(room.id, room);
	return	buildPublicRoom(room);
};

export const deleteRoom = async (roomId: string): Promise<boolean> => {
	if (roomsStore === null) {
		return	false;
	}
	const	room = roomsStore.get(roomId);
	if (room === undefined) {
		return	false;
	}
	stopLoop(room);
	return	roomsStore.delete(roomId);
};

export const getRoom = async (roomId: string): Promise<PublicRoom | null> => {
	if (roomsStore === null) {
		return	null;
	}
	const	room = roomsStore.get(roomId);
	if (room === undefined) {
		return	null;
	}
	return	buildPublicRoom(room);
};

export const joinRoomAsPlayer = (
	roomId: string,
	seat: Seat,
	profile: ClientProfile,
	socket: LiveSocket
): { ok: true; room: PublicRoom } | { ok: false; reason: string } => {
	const	store = ensureStore();
	const	room = store.get(roomId);
	if (room === undefined) {
		return	{ ok: false, reason: 'Room not found' };
	}
	try {
		const	slot = upsertPlayer(room, seat, profile, socket);
		attachSocketHandlers(room, slot, seat);
		sendSafe(socket, { type: 'joined', seat });
		startLoop(room);
		broadcastState(room);
		return	{ ok: true, room: buildPublicRoom(room) };
	} catch (error: unknown) {
		return	{ ok: false, reason: (error as Error).message };
	}
};

export const joinRoomAsViewer = (
	roomId: string,
	profile: ClientProfile,
	socket: LiveSocket
): { ok: true; room: PublicRoom } | { ok: false; reason: string } => {
	const	store = ensureStore();
	const	room = store.get(roomId);
	if (room === undefined) {
		return	{ ok: false, reason: 'Room not found' };
	}
	const	viewer = upsertViewer(room, profile, socket);
	attachSocketHandlers(room, viewer, 'viewer');
	sendSafe(socket, { type: 'joined', role: 'viewer' });
	broadcastState(room);
	return	{ ok: true, room: buildPublicRoom(room) };
};
