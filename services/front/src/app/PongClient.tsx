"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GatewayConfig } from './page';
import styles from './page.module.css';

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

type PongClientProps = {
	gatewayConfig: GatewayConfig;
};

function	extractMatchId(raw: string): string {
	const	trimmed = raw.trim();

	if (trimmed === '')
		return '';
	try {
		const	url = new URL(trimmed);
		const	fromQuery = url.searchParams.get('matchId');

		if (fromQuery && fromQuery.trim() !== '')
			return fromQuery.trim();
		const	segments = url.pathname.split('/').filter(Boolean);

		if (segments.length > 0)
			return segments[segments.length - 1].trim();
	} catch {
		// Not a URL, treat as raw ID
	}
	return trimmed;
}

export default function PongClient({ gatewayConfig }: PongClientProps) {
	const	socketRef = useRef<Socket | null>(null);
	const	pressedRef = useRef<'up' | 'down' | 'none'>('none');

	const	[connected, setConnected] = useState(false);
	const	[matchId, setMatchId] = useState<string>('');
	const	[playerName, setPlayerName] = useState<string>('');
	const	[joinInput, setJoinInput] = useState<string>('');
	const	[pongState, setPongState] = useState<PongState | null>(null);
	const	[lastError, setLastError] = useState<string | null>(null);

	const	requireSocket = useCallback((): Socket | null => {
		const	socket = socketRef.current;

		if (!socket) {
			setLastError('Non connecté au serveur');
			return null;
		}
		return socket;
	}, []);

	const	handleConnect = useCallback((): void => {
		if (socketRef.current) {
			socketRef.current.disconnect();
		}

		const	socket = io(gatewayConfig.origin, {
			path: gatewayConfig.path,
			transports: ['websocket'],
		});

		socketRef.current = socket;

		socket.on('connect', () => {
			setConnected(true);
			setLastError(null);
		});

		socket.on('disconnect', () => {
			setConnected(false);
		});

		socket.on('connect_error', (error) => {
			setLastError(error.message);
		});

		socket.on('pong:state', (state: PongState) => {
			setPongState(state);
			setMatchId(state.matchId);
		});

		socket.on('pong:error', (message: string) => {
			setLastError(message);
		});
	}, [gatewayConfig.origin, gatewayConfig.path]);

	const	handleDisconnect = useCallback((): void => {
		if (socketRef.current) {
			socketRef.current.disconnect();
			socketRef.current = null;
		}
		setConnected(false);
	}, []);

	const	handleCreate = useCallback((): void => {
		const	socket = requireSocket();

		if (!socket) {
			return;
		}

		socket.emit(
			'pong:create',
			{ player: playerName || 'player' },
			(response: { matchId?: string; state?: PongState; error?: string }) => {
				if (response?.error) {
					setLastError(response.error);
					return;
				}

				if (response?.matchId) {
					setMatchId(response.matchId);
					setJoinInput(response.matchId);
				}

				if (response?.state) {
					setPongState(response.state);
				}
			},
		);
	}, [playerName, requireSocket]);

	const	handleJoin = useCallback((): void => {
		const	socket = requireSocket();

		if (!socket) {
			return;
		}

		const	targetId = joinInput ? extractMatchId(joinInput) : matchId;

		if (!targetId) {
			setLastError('Aucun match à rejoindre');
			return;
		}

		setMatchId(targetId);

		socket.emit(
			'pong:join',
			{ matchId: targetId, player: playerName || 'player' },
			(response: { matchId?: string; state?: PongState; error?: string }) => {
				if (response?.error) {
					setLastError(response.error);
					return;
				}

				if (response?.matchId) {
					setMatchId(response.matchId);
				}

				if (response?.state) {
					setPongState(response.state);
				}
			},
		);
	}, [joinInput, matchId, playerName, requireSocket]);

	const	handleMove = useCallback(
		(direction: 'up' | 'down' | 'none'): void => {
			const	socket = requireSocket();

			if (!socket || !matchId) {
				return;
			}

			if (pressedRef.current === direction) {
				return;
			}

			pressedRef.current = direction;

			socket.emit('pong:move', {
				matchId,
				player: playerName || 'player',
				direction,
			});
		},
		[matchId, playerName, requireSocket],
	);

	useEffect(() => {
		const	onKeyDown = (event: KeyboardEvent): void => {
			if (event.repeat)
				return;
			if (event.key === 'ArrowUp')
				handleMove('up');
			else if (event.key === 'ArrowDown')
				handleMove('down');
		};

		const	onKeyUp = (event: KeyboardEvent): void => {
			if (event.key === 'ArrowUp' || event.key === 'ArrowDown')
				handleMove('none');
		};

		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);

		return () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
			pressedRef.current = 'none';
		};
	}, [handleMove]);

	const	renderCanvas = (state: PongState | null): React.ReactNode => {
		if (!state) {
			return (
				<div className={styles.tagline}>
					Créez ou rejoignez un match pour voir le terrain.
				</div>
			);
		}

		const	VIEWPORT_WIDTH = 800;
		const	VIEWPORT_HEIGHT = 600;

		const	scaleX = VIEWPORT_WIDTH / state.width;
		const	scaleY = VIEWPORT_HEIGHT / state.height;

		return (
			<svg
				className={styles.canvas}
				viewBox={`0 0 ${VIEWPORT_WIDTH} ${VIEWPORT_HEIGHT}`}
				preserveAspectRatio="xMidYMid meet"
			>
				<line
					x1={VIEWPORT_WIDTH / 2}
					y1={0}
					x2={VIEWPORT_WIDTH / 2}
					y2={VIEWPORT_HEIGHT}
					stroke="#1d4ed8"
					strokeDasharray="8 8"
					strokeWidth="4"
				/>
				<rect
					x={16}
					y={state.leftY * scaleY}
					width={16}
					height={state.paddleHeight * scaleY}
					fill="#22d3ee"
					rx="4"
				/>
				<rect
					x={VIEWPORT_WIDTH - 32}
					y={state.rightY * scaleY}
					width={16}
					height={state.paddleHeight * scaleY}
					fill="#a855f7"
					rx="4"
				/>
				<circle
					cx={state.ballX * scaleX}
					cy={state.ballY * scaleY}
					r={10}
					fill="#fbbf24"
				/>
			</svg>
		);
	};

	return (
		<div className={styles.card}>
			<div className={styles.cardHeader}>
				<div className={styles.label}>Client Pong</div>
				<div className={styles.status}>
					{connected ? 'Connecté' : 'Déconnecté'}
				</div>
			</div>

			<div className={styles.row}>
				<button
					className={styles.button}
					onClick={handleConnect}
					disabled={connected}
				>
					Connexion
				</button>
				<button
					className={`${styles.button} ${styles.secondary}`}
					onClick={handleDisconnect}
					disabled={!connected}
				>
					Déconnexion
				</button>
			</div>

			<div className={styles.row}>
				<div className={styles.inputGroup}>
					<label
						className={styles.fieldLabel}
						htmlFor="player-name-input"
					>
						Nom du joueur
					</label>
					<input
						id="player-name-input"
						className={styles.input}
						type="text"
						value={playerName}
						onChange={(event) => setPlayerName(event.target.value)}
						placeholder="Entrez votre nom"
						disabled={!connected}
					/>
				</div>
			</div>

			<div className={styles.row}>
				<div className={styles.inputGroup}>
					<label
						className={styles.fieldLabel}
						htmlFor="match-link-input"
					>
						Lien ou ID du match à rejoindre
					</label>
					<input
						id="match-link-input"
						className={styles.input}
						type="text"
						value={joinInput}
						onChange={(event) => setJoinInput(event.target.value)}
						placeholder="Collez ici le lien ou l'identifiant du match"
						disabled={!connected}
					/>
				</div>
			</div>

			<div className={styles.row}>
				<button
					className={styles.button}
					onClick={handleCreate}
					disabled={!connected}
				>
					Créer match
				</button>
				<button
					className={`${styles.button} ${styles.secondary}`}
					onClick={handleJoin}
					disabled={!connected}
				>
					Rejoindre match
				</button>
			</div>

			{lastError && <div className={styles.error}>{lastError}</div>}

			<div className={styles.board}>
				<div className={styles.stateLine}>
					<span>Match</span>
					<span>{matchId || 'Aucun'}</span>
				</div>
				{pongState && (
					<>
						<div className={styles.stateLine}>
							<span>Score</span>
							<span>
								{pongState.scoreLeft} - {pongState.scoreRight}
							</span>
						</div>
						<div className={styles.stateLine}>
							<span>Statut : {pongState.status}</span>
						</div>
					</>
				)}

				{renderCanvas(pongState)}
			</div>
		</div>
	);
}
