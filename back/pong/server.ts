import Fastify, {
	FastifyInstance,
	FastifyReply,
	FastifyRequest
} from 'fastify';
import websocket from '@fastify/websocket';
import fastifyCookie from '@fastify/cookie';
import { randomBytes } from 'crypto';
import {
	createRoom,
	deleteRoom,
	getRoom,
	initRoomsStore,
	closeRoomsStore,
	joinRoomAsPlayer,
	joinRoomAsViewer,
	ClientProfile,
	LiveSocket
} from './src/rooms.js';

declare module 'fastify' {
	interface FastifyRequest {
		clientId?: string;
	}
}

const	serviceName = 'pong-back';
const	clientCookieName = 'pongClientId';

interface CreateRoomBody {
	[key: string]: unknown;
}

interface RoomParams {
	roomId: string;
}

interface WsQuery {
	role?: 'player' | 'viewer';
	seat?: 'left' | 'right';
	name?: string;
	avatar?: string;
}

const	generateClientId
= (): string => randomBytes(6).toString('hex').toUpperCase();

const	parseProfile
= (request: FastifyRequest, query: WsQuery): ClientProfile => ({
	id: request.clientId ?? generateClientId(),
	name: query.name ?? undefined,
	avatar: query.avatar ?? undefined
});

const	registerIdentityHook = (fastify: FastifyInstance) => {
	fastify.addHook('onRequest', async (request, reply) => {
		const	existing = request.cookies?.[clientCookieName];
		if (existing !== undefined) {
			request.clientId = existing;
			return;
		}
		const	clientId = generateClientId();
		reply.setCookie(clientCookieName, clientId, {
			path: '/',
			httpOnly: false,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30
		});
		request.clientId = clientId;
	});
};

const	registerRoomsRoutes = (fastify: FastifyInstance) => {
	const	createRoomHandler = async (
		request: FastifyRequest<{ Body: CreateRoomBody }>,
		reply: FastifyReply
	) => {
		try {
			const	room = await createRoom(request.body ?? {});
			reply.code(201);
			return	room;
		} catch (error: unknown) {
			const	typedError = error as { statusCode?: number; message?: string };
			const	statusCode = typedError.statusCode ?? 500;
			reply.code(statusCode);
			return	{
				status: 'error',
				message: typedError.message ?? 'Unable to create room'
			};
		}
	};

	const	deleteRoomHandler = async (
		request: FastifyRequest<{ Params: RoomParams }>,
		reply: FastifyReply
	) => {
		const	roomId = request.params.roomId;
		const	deleted = await deleteRoom(roomId);
		if (deleted === false) {
			reply.code(404);
			return	{
				status: 'error',
				message: 'Room not found'
			};
		}
		reply.code(204);
		return	reply.send();
	};

	const	getRoomHandler = async (
		request: FastifyRequest<{ Params: RoomParams }>,
		reply: FastifyReply
	) => {
		const	roomId = request.params.roomId;
		const	room = await getRoom(roomId);
		if (room === null) {
			reply.code(404);
			return	{
				status: 'error',
				message: 'Room not found'
			};
		}
		return	room;
	};

	const	wsHandler = async (connection: { socket: LiveSocket }, request: FastifyRequest<{ Params: RoomParams; Querystring: WsQuery }>) => {
		const	roomId = request.params.roomId;
		const	role = request.query.role ?? 'viewer';
		const	seat = request.query.seat ?? 'left';
		const	profile = parseProfile(request, request.query);
		if (request.clientId === undefined) {
			connection.socket.send(JSON.stringify({ type: 'error', reason: 'No client id' }));
			connection.socket.close();
			return;
		}
		if (role === 'player') {
			const	result = joinRoomAsPlayer(roomId, seat === 'right' ? 'right' : 'left', profile, connection.socket);
			if (!result.ok) {
				connection.socket.send(JSON.stringify({ type: 'error', reason: result.reason }));
				connection.socket.close();
				return;
			}
			return;
		}
		const	result = joinRoomAsViewer(roomId, profile, connection.socket);
		if (!result.ok) {
			connection.socket.send(JSON.stringify({ type: 'error', reason: result.reason }));
			connection.socket.close();
		}
	};

	fastify.post('/rooms', createRoomHandler);
	fastify.delete('/rooms/:roomId', deleteRoomHandler);
	fastify.get('/rooms/:roomId', getRoomHandler);
	fastify.get('/rooms/:roomId/ws', { websocket: true }, wsHandler);
};

const	buildTestPage = (): string => `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Pong Test</title>
<style>
body { font-family: sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 16px; }
.row { display: flex; gap: 12px; margin-bottom: 12px; }
label { display: flex; flex-direction: column; font-size: 12px; }
input, select { padding: 6px 8px; background: #1e293b; color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; }
button { padding: 8px 12px; background: #22c55e; color: #0f172a; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
canvas { background: #0b1224; border: 1px solid #334155; border-radius: 8px; display: block; }
.pill { padding: 4px 8px; background: #1e293b; border-radius: 12px; }
.col { display: flex; flex-direction: column; gap: 8px; }
</style>
</head>
<body>
	<h1>Pong realtime demo</h1>
	<div class="row">
		<label>Room ID<input id="roomId" placeholder="auto create" /></label>
		<label>Seat<select id="seat"><option value="left">Left</option><option value="right">Right</option><option value="viewer">Viewer</option></select></label>
		<label>Name<input id="name" placeholder="Player name" /></label>
		<label>Avatar URL<input id="avatar" placeholder="https://..." /></label>
		<button id="create">Create room</button>
		<button id="connect">Connect</button>
	</div>
	<div class="row">
		<div class="pill" id="status">Disconnected</div>
		<div class="pill" id="scores">0 - 0</div>
	</div>
	<canvas id="board" width="800" height="480"></canvas>
	<div class="row">
		<div class="col">
			<strong>Players</strong>
			<div id="players"></div>
		</div>
		<div class="col">
			<strong>Viewers</strong>
			<div id="viewers"></div>
		</div>
	</div>
<script>
const board = document.getElementById('board');
const ctx = board.getContext('2d');
const state = { room: null };
let ws = null;

const paint = () => {
	ctx.fillStyle = '#0b1224';
	ctx.fillRect(0, 0, board.width, board.height);
	if (!state.room) return;
	const g = state.room.state;
	ctx.strokeStyle = '#1e293b';
	ctx.setLineDash([10, 10]);
	ctx.beginPath();
	ctx.moveTo(board.width / 2, 0);
	ctx.lineTo(board.width / 2, board.height);
	ctx.stroke();
	ctx.setLineDash([]);
	ctx.fillStyle = '#22c55e';
	if (state.room.players.left) {
		ctx.fillRect(24, (state.room.players.left.paddleY ?? g.height/2) - g.paddleHeight/2, g.paddleWidth, g.paddleHeight);
	}
	if (state.room.players.right) {
		ctx.fillRect(g.width - 24 - g.paddleWidth, (state.room.players.right.paddleY ?? g.height/2) - g.paddleHeight/2, g.paddleWidth, g.paddleHeight);
	}
	ctx.beginPath();
	ctx.arc(g.ballX, g.ballY, 6, 0, Math.PI * 2);
	ctx.fill();
};

const updateLists = () => {
	const players = document.getElementById('players');
	const viewers = document.getElementById('viewers');
	players.innerHTML = '';
	viewers.innerHTML = '';
	if (!state.room) return;
	const addLine = (parent, label, p) => {
		const div = document.createElement('div');
		div.textContent = label + ': ' + (p.name || p.id);
		parent.appendChild(div);
	};
	if (state.room.players.left) addLine(players, 'Left', state.room.players.left);
	if (state.room.players.right) addLine(players, 'Right', state.room.players.right);
	state.room.viewers.forEach((v) => addLine(viewers, 'Viewer', v));
};

const setStatus = (txt) => document.getElementById('status').textContent = txt;
const setScores = (left, right) => document.getElementById('scores').textContent = left + ' - ' + right;

const connect = () => {
	const roomIdInput = document.getElementById('roomId');
	const seat = document.getElementById('seat').value;
	const name = encodeURIComponent(document.getElementById('name').value);
	const avatar = encodeURIComponent(document.getElementById('avatar').value);
	const roomId = roomIdInput.value.trim();
	if (!roomId) {
		alert('Provide a room id or create one');
		return;
	}
	if (ws) ws.close();
	const role = seat === 'viewer' ? 'viewer' : 'player';
	ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/rooms/' + roomId + '/ws?role=' + role + '&seat=' + seat + '&name=' + name + '&avatar=' + avatar);
	ws.onopen = () => setStatus('Connected to ' + roomId);
	ws.onclose = () => { setStatus('Disconnected'); };
	ws.onmessage = (event) => {
		const msg = JSON.parse(event.data);
		if (msg.type === 'state') {
			state.room = msg.payload;
			setScores(state.room.state.leftScore, state.room.state.rightScore);
			updateLists();
			paint();
		}
	};
	board.onmousemove = (e) => {
		if (!ws || ws.readyState !== 1) return;
		if (seat === 'viewer') return;
		const rect = board.getBoundingClientRect();
		const y = e.clientY - rect.top;
		ws.send(JSON.stringify({ type: 'move', y }));
	};
};

document.getElementById('connect').onclick = connect;
document.getElementById('create').onclick = async () => {
	const res = await fetch('/rooms', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
	if (!res.ok) {
		const text = await res.text().catch(() => 'unknown error');
		alert('Erreur création room: ' + text);
		return;
	}
	let room = null;
	try {
		room = await res.json();
	} catch (e) {
		const text = await res.text().catch(() => '');
		alert('Réponse inattendue: ' + text);
		return;
	}
	document.getElementById('roomId').value = room.id;
	setStatus('Room created ' + room.id);
};
paint();
</script>
</body>
</html>`;

const	registerHealthRoutes = (fastify: FastifyInstance) => {
	const	handler = async () => ({ status: 'ok', service: serviceName, version: '1.0.0' });
	fastify.get('/health', handler);
};

const	registerServiceRoutes = (fastify: FastifyInstance) => {
	const	handler = async () => ({ status: 'ok', service: serviceName, version: '1.0.0', description: 'API for pong'});
	fastify.get('/', handler);
	fastify.get('/demo', async (_request, reply) => {
		reply.type('text/html');
		return	buildTestPage();
	});
};

const	registerFallbackHandler = (fastify: FastifyInstance) => {
	fastify.setNotFoundHandler(async (_request, reply) => {
		reply.code(404);
		return	{ status: 'error', service: serviceName, version: '1.0.0', message: 'Not found' };
	});
};

export const	buildServer = (): FastifyInstance => {
	const	fastify = Fastify({ logger: true });

	fastify.register(fastifyCookie);
	registerIdentityHook(fastify);
	fastify.register(websocket);

	fastify.addHook('onClose', async () => {
		await	closeRoomsStore();
	});

	registerHealthRoutes(fastify);
	registerServiceRoutes(fastify);
	registerRoomsRoutes(fastify);
	registerFallbackHandler(fastify);

	return	fastify;
};

const	start = async (): Promise<void> => {
	const	fastify = buildServer();

	fastify.log.info('Starting pong-back server...');
	try {
		await	initRoomsStore();
		await	fastify.listen({ port: 4001, host: '0.0.0.0' });
		fastify.log.info('Pong-back server started on port 4001');
	} catch (error) {
		fastify.log.error(error, 'Error starting pong-back server:');
		fastify.log.error(error);
		process.exit(1);
	}
};

void	start();

