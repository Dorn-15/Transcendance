"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import styles from './page.module.css';

type ClientKey = 'A' | 'B';

type PongState = {
	matchId: string;
	status: 'waiting' | 'running' | 'ended';
	width: number;
	height: number;
	paddleHeight: number;
	ballX: number;
	ballY: number;
	leftY: number;
	rightY: number;
	scoreLeft: number;
	scoreRight: number;
	lastUpdate: number;
};

type ClientState = {
	name: string;
	connected: boolean;
	matchId?: string;
	lastError?: string;
};

const	initialClients: Record<ClientKey, ClientState> = {
	A: { name: 'alice', connected: false },
	B: { name: 'bob', connected: false },
};

export default function Home() {
	const	gatewayConfig = useMemo(() => {
		const	normalizeOrigin = (value: string): string =>
			value.replace(/\/+$/, '').replace(/\/ws$/, '');

		const	fromEnv =
			process.env.NEXT_PUBLIC_GATEWAY_ORIGIN ??
			process.env.NEXT_PUBLIC_GATEWAY_URL;

		if (fromEnv) {
			return {
				origin: normalizeOrigin(fromEnv),
				path: '/ws/socket.io',
			};
		}

		if (typeof window !== 'undefined') {
			return {
				origin: `${window.location.protocol}//${window.location.host}`,
				path: '/ws/socket.io',
			};
		}

		return {
			origin: 'http://localhost:4006',
			path: '/socket.io',
		};
	}, []);

	const	[clients, setClients] =
		useState<Record<ClientKey, ClientState>>(initialClients);
	const	[currentMatch, setCurrentMatch] = useState<string>('');
	const	[pongState, setPongState] = useState<PongState | null>(null);
	const	[logs, setLogs] = useState<string[]>([]);
const	pressed = useRef<Record<ClientKey, 'up' | 'down' | 'none'>>({
	A: 'none',
	B: 'none',
});

	const	socketA = useRef<Socket | null>(null);
	const	socketB = useRef<Socket | null>(null);

	const	socketRefs = useMemo(
		() => ({
			A: socketA,
			B: socketB,
		}),
		[],
	);

	const	updateClient = (key: ClientKey, patch: Partial<ClientState>): void => {
		setClients((prev) => ({
			...prev,
			[key]: {
				...prev[key],
				...patch,
			},
		}));
	};

	const	appendLog = (line: string): void => {
		setLogs((prev) => [line, ...prev].slice(0, 60));
	};

	const	requireSocket = (key: ClientKey): Socket | null => {
		const	ref = socketRefs[key].current;

		if (!ref) {
			updateClient(key, { lastError: 'Connectez ce client d abord' });
			return null;
		}

		return ref;
	};

	const	handleConnect = (key: ClientKey): void => {
		if (socketRefs[key].current) {
			socketRefs[key].current?.disconnect();
		}

		const	socket = io(gatewayConfig.origin, {
			path: gatewayConfig.path,
			transports: ['websocket'],
		});

		socketRefs[key].current = socket;

		socket.on('connect', () => {
			updateClient(key, { connected: true, lastError: undefined });
			appendLog(`[${key}] connecté (${socket.id})`);
		});

		socket.on('disconnect', (reason) => {
			updateClient(key, { connected: false });
			appendLog(`[${key}] déconnecté: ${reason}`);
		});

		socket.on('connect_error', (error) => {
			updateClient(key, { lastError: error.message });
			appendLog(`[${key}] erreur: ${error.message}`);
		});

		socket.on('pong:state', (state: PongState) => {
			setPongState(state);
			setCurrentMatch(state.matchId);
		});

		socket.on('pong:error', (message: string) => {
			updateClient(key, { lastError: message });
			appendLog(`[${key}] erreur: ${message}`);
		});
	};

	const	handleDisconnect = (key: ClientKey): void => {
		socketRefs[key].current?.disconnect();
		socketRefs[key].current = null;
		updateClient(key, { connected: false, matchId: undefined });
	};

	const	handleCreate = (key: ClientKey): void => {
		const	socket = requireSocket(key);

		if (!socket) {
			return;
		}

		socket.emit(
			'pong:create',
			{ player: clients[key].name },
			(response: { matchId?: string; state?: PongState; error?: string }) => {
				if (response?.error) {
					updateClient(key, { lastError: response.error });
					appendLog(`[${key}] échec création: ${response.error}`);
					return;
				}

				if (response?.matchId) {
					updateClient(key, { matchId: response.matchId });
					setCurrentMatch(response.matchId);
					appendLog(`[${key}] match ${response.matchId} créé`);
				}

				if (response?.state) {
					setPongState(response.state);
				}
			},
		);
	};

	const	handleJoin = (key: ClientKey): void => {
		const	socket = requireSocket(key);

		if (!socket) {
			return;
		}

		const	matchId = clients[key].matchId || currentMatch;

		if (!matchId) {
			updateClient(key, { lastError: 'Aucun match à rejoindre' });
			return;
		}

		socket.emit(
			'pong:join',
			{ matchId, player: clients[key].name },
			(response: { matchId?: string; state?: PongState; error?: string }) => {
				if (response?.error) {
					updateClient(key, { lastError: response.error });
					appendLog(`[${key}] échec join: ${response.error}`);
					return;
				}

				if (response?.matchId) {
					updateClient(key, { matchId: response.matchId });
					setCurrentMatch(response.matchId);
					appendLog(`[${key}] a rejoint ${response.matchId}`);
				}

				if (response?.state) {
					setPongState(response.state);
				}
			},
		);
	};

	const	handleMove = (key: ClientKey, direction: 'up' | 'down' | 'none'): void => {
		const	socket = requireSocket(key);

		if (!socket || !currentMatch) {
			return;
		}

	if (pressed.current[key] === direction) {
		return;
	}

	pressed.current[key] = direction;
		socket.emit('pong:move', {
			matchId: currentMatch,
			player: clients[key].name,
			direction,
		});
	};

	useEffect(() => {
		const	onKeyDown = (event: KeyboardEvent): void => {
			if (event.repeat)
				return;
			if (event.key === 'w')
				handleMove('A', 'up');
			else if (event.key === 's')
				handleMove('A', 'down');
			else if (event.key === 'ArrowUp')
				handleMove('B', 'up');
			else if (event.key === 'ArrowDown')
				handleMove('B', 'down');
		};

		const	onKeyUp = (event: KeyboardEvent): void => {
			if (event.key === 'w' || event.key === 's')
				handleMove('A', 'none');
			else if (event.key === 'ArrowUp' || event.key === 'ArrowDown')
				handleMove('B', 'none');
		};

		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);

		return () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
			pressed.current = { A: 'none', B: 'none' };
		};
	}, [clients, currentMatch]);

	const	renderCanvas = (): React.ReactNode | null => {
		if (!pongState) {
			return null;
		}

		const	scaleX = 1;
		const	scaleY = 1;

		return (
			<svg
				className={styles.canvas}
				viewBox={`0 0 ${pongState.width} ${pongState.height}`}
				preserveAspectRatio="xMidYMid meet"
			>
				<line
					x1={pongState.width / 2}
					y1={0}
					x2={pongState.width / 2}
					y2={pongState.height}
					stroke="#1d4ed8"
					strokeDasharray="8 8"
					strokeWidth="4"
				/>
				<rect
					x={8}
					y={pongState.leftY * scaleY}
					width={12}
					height={pongState.paddleHeight * scaleY}
					fill="#22d3ee"
					rx="4"
				/>
				<rect
					x={pongState.width - 20}
					y={pongState.rightY * scaleY}
					width={12}
					height={pongState.paddleHeight * scaleY}
					fill="#a855f7"
					rx="4"
				/>
				<circle
					cx={pongState.ballX * scaleX}
					cy={pongState.ballY * scaleY}
					r={10}
					fill="#fbbf24"
				/>
			</svg>
		);
	};

	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<div className={styles.header}>
					<div className={styles.title}>Gateway + Games (Pong)</div>
					<div className={styles.tagline}>
						Connexion WS, création et test rapide à deux clients.
					</div>
				</div>

				<div className={styles.grid}>
					{(['A', 'B'] as ClientKey[]).map((key) => (
						<div className={styles.card} key={key}>
							<div className={styles.cardHeader}>
								<div className={styles.label}>Client {key}</div>
								<div className={styles.status}>
									{clients[key].connected ? 'Connecté' : 'Hors ligne'}
								</div>
							</div>

							<div className={styles.inputs}>
								<input
									className={styles.input}
									value={clients[key].name}
									onChange={(e) =>
										updateClient(key, { name: e.target.value })
									}
									placeholder="Pseudo"
								/>
								<input
									className={styles.input}
									value={clients[key].matchId ?? ''}
									onChange={(e) =>
										updateClient(key, { matchId: e.target.value })
									}
									placeholder="Match ID (auto rempli)"
								/>
							</div>

							<div className={styles.row}>
								<button
									className={styles.button}
									onClick={() => handleConnect(key)}
								>
									Connexion
								</button>
								<button
									className={`${styles.button} ${styles.secondary}`}
									onClick={() => handleDisconnect(key)}
								>
									Couper
								</button>
							</div>

							<div className={styles.row}>
								<button
									className={styles.button}
									onClick={() => handleCreate(key)}
									disabled={!clients[key].connected}
								>
									Créer match
								</button>
								<button
									className={`${styles.button} ${styles.secondary}`}
									onClick={() => handleJoin(key)}
									disabled={!clients[key].connected}
								>
									Rejoindre
								</button>
							</div>

							<div className={styles.row}>
								<div className={styles.tagline}>
									{key === 'A'
										? 'Déplacement: W / S'
										: 'Déplacement: Flèches ↑ / ↓'}
								</div>
							</div>

							{clients[key].lastError && (
								<div className={styles.error}>{clients[key].lastError}</div>
							)}
						</div>
					))}

					<div className={styles.card}>
						<div className={styles.cardHeader}>
							<div className={styles.label}>Etat du match</div>
							<div className={styles.status}>
								{currentMatch ? `ID: ${currentMatch}` : 'Aucun match'}
							</div>
						</div>

						<div className={styles.board}>
							{pongState ? (
								<>
									<div className={styles.stateLine}>
										<span>Score</span>
										<span>
											{pongState.scoreLeft} - {pongState.scoreRight}
										</span>
									</div>
									<div className={styles.stateLine}>
										<span>Statut</span>
										<span>{pongState.status}</span>
									</div>
									{renderCanvas()}
								</>
							) : (
								<div className={styles.tagline}>
									Créez ou rejoignez un match pour voir le terrain.
								</div>
							)}
						</div>
					</div>
				</div>

				<div className={styles.card}>
					<div className={styles.cardHeader}>
						<div className={styles.label}>Journal</div>
						<div className={styles.status}>
									{`${gatewayConfig.origin}${gatewayConfig.path}`}
						</div>
					</div>
					<div className={styles.log}>
						{logs.length === 0 ? (
							<div>En attente d événements...</div>
						) : (
							logs.map((line, idx) => <div key={idx}>{line}</div>)
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
