"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GatewayConfig } from '@/app/play/[gameId]/page';
import type { PongState } from '@transcendance/pong';
import styles from './pong.module.css';

type PongProps = {
	gatewayConfig: GatewayConfig;
};

function extractMatchId(raw: string): string {
	const trimmed = raw.trim();
	if (trimmed === '') return '';
	try {
		const url = new URL(trimmed);
		const fromQuery = url.searchParams.get('matchId');
		if (fromQuery && fromQuery.trim() !== '') return fromQuery.trim();
		const segments = url.pathname.split('/').filter(Boolean);
		if (segments.length > 0) return segments[segments.length - 1].trim();
	} catch {
		// Not a URL
	}
	return trimmed;
}

export function Pong({ gatewayConfig }: PongProps) {
	const socketRef = useRef<Socket | null>(null);
	const pressedRef = useRef<'up' | 'down' | 'none'>('none');

	const [connected, setConnected] = useState(false);
	const [matchId, setMatchId] = useState<string>('');
	const [playerName, setPlayerName] = useState<string>('');
	const [joinInput, setJoinInput] = useState<string>('');
	const [pongState, setPongState] = useState<PongState | null>(null);
	const [lastError, setLastError] = useState<string | null>(null);
	
	const activeMatch = pongState && pongState.status !== 'ended';

	const requireSocket = useCallback((): Socket | null => {
		const socket = socketRef.current;
		if (!socket) {
			setLastError('Non connecté au serveur');
			return null;
		}
		return socket;
	}, []);

	// --- LOGIQUE SOCKET (INCHANGÉE) ---
	const handleConnect = useCallback((): void => {
		if (socketRef.current) socketRef.current.disconnect();
		console.log("Connexion...", gatewayConfig.origin);

		const socket = io(gatewayConfig.origin, {
			path: gatewayConfig.path,
			transports: ['websocket'],
		});
		socketRef.current = socket;

		socket.on('connect', () => { setConnected(true); setLastError(null); });
		socket.on('disconnect', () => { setConnected(false); });
		socket.on('connect_error', (err) => { setLastError("Erreur: " + err.message); });
		socket.on('pong:state', (state: PongState) => { setPongState(state); setMatchId(state.matchId); });
		socket.on('pong:error', (msg: string) => { setLastError(msg); });
	}, [gatewayConfig.origin, gatewayConfig.path]);

	const handleDisconnect = useCallback((): void => {
		if (socketRef.current) {
			socketRef.current.disconnect();
			socketRef.current = null;
		}
		setConnected(false);
		setPongState(null);
		setMatchId('');
	}, []);

	const handleCreate = useCallback((): void => {
		const socket = requireSocket();
		if (!socket) return;
		if (activeMatch) { setLastError('Partie en cours.'); return; }

		socket.emit('pong:create', { player: playerName || 'PLAYER 1' }, (res: any) => {
			if (res?.error) setLastError(res.error);
			if (res?.matchId) { setMatchId(res.matchId); setJoinInput(res.matchId); }
			if (res?.state) setPongState(res.state);
		});
	}, [activeMatch, playerName, requireSocket]);

	const handleJoin = useCallback((): void => {
		const socket = requireSocket();
		if (!socket) return;
		const targetId = joinInput ? extractMatchId(joinInput) : matchId;
		const normalizedMatchId = targetId && targetId.trim() !== '' ? targetId : undefined;
		if (normalizedMatchId) setMatchId(normalizedMatchId);

		socket.emit('pong:join', { matchId: normalizedMatchId, player: playerName || 'PLAYER 2' }, (res: any) => {
			if (res?.error) setLastError(res.error);
			if (res?.matchId) setMatchId(res.matchId);
			if (res?.state) setPongState(res.state);
		});
	}, [joinInput, matchId, playerName, requireSocket]);

	const handleMove = useCallback((direction: 'up' | 'down' | 'none'): void => {
		const socket = requireSocket();
		if (!socket || !matchId) return;
		if (pressedRef.current === direction) return;
		pressedRef.current = direction;
		socket.emit('pong:move', { matchId, player: playerName || 'player', direction });
	}, [matchId, playerName, requireSocket]);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.repeat) return;
			if (e.key === 'ArrowUp') handleMove('up');
			else if (e.key === 'ArrowDown') handleMove('down');
		};
		const onKeyUp = (e: KeyboardEvent) => {
			if (e.key === 'ArrowUp' || e.key === 'ArrowDown') handleMove('none');
		};
		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);
		return () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
			pressedRef.current = 'none';
		};
	}, [handleMove]);

	// --- RENDU VISUEL MODIFIÉ (STYLE RETRO) ---
	const renderCanvas = (state: PongState | null): React.ReactNode => {
		if (!state) {
			return (
				<div className={styles.tagline}>
					INSERT COIN<br /><br />
					(CRÉEZ OU REJOIGNEZ UNE PARTIE)
				</div>
			);
		}

		const VIEWPORT_WIDTH = 800;
		const VIEWPORT_HEIGHT = 600;
		const scaleX = VIEWPORT_WIDTH / state.width;
		const scaleY = VIEWPORT_HEIGHT / state.height;

		return (
			<svg
				className={styles.canvas}
				viewBox={`0 0 ${VIEWPORT_WIDTH} ${VIEWPORT_HEIGHT}`}
				preserveAspectRatio="xMidYMid meet"
				shapeRendering="crispEdges" // Important pour les bords nets (pixel perfect)
			>
				{/* SCORES : Intégrés dans le SVG pour le look Arcade */}
				{/* Score Gauche */}
				<text 
					x={VIEWPORT_WIDTH / 4} 
					y={100} 
					fill="white" 
					fontSize="80" 
					fontFamily="'Press Start 2P', monospace" 
					textAnchor="middle"
				>
					{state.scoreLeft}
				</text>

				{/* Score Droite */}
				<text 
					x={(VIEWPORT_WIDTH / 4) * 3} 
					y={100} 
					fill="white" 
					fontSize="80" 
					fontFamily="'Press Start 2P', monospace" 
					textAnchor="middle"
				>
					{state.scoreRight}
				</text>

				{/* Filet Central (Carrés discontinus) */}
				<line
					x1={VIEWPORT_WIDTH / 2}
					y1={0}
					x2={VIEWPORT_WIDTH / 2}
					y2={VIEWPORT_HEIGHT}
					stroke="white"
					strokeWidth={10} // Ligne épaisse
					strokeDasharray="15, 15" // Tirets pour faire des carrés
				/>

				{/* Raquette Gauche (Carré blanc) */}
				<rect
					x={(state.paddleThickness - 4 * scaleX) * scaleX}
					y={state.leftY * scaleY}
					width={15 * scaleX} // Un peu plus large pour le style rétro
					height={state.paddleHeight * scaleY}
					fill="white"
				/>

				{/* Raquette Droite (Carré blanc) */}
				<rect
					x={VIEWPORT_WIDTH - state.paddleThickness * scaleX}
					y={state.rightY * scaleY}
					width={15 * scaleX}
					height={state.paddleHeight * scaleY}
					fill="white"
				/>
				{/* Balle (Carré blanc) */}
				<rect
					x={(state.ballX * scaleX) - (state.ballRadius)}
					y={(state.ballY * scaleY) - (state.ballRadius)}
					width={state.ballRadius * 2}
					height={state.ballRadius * 2}
					fill="white"
				/>
			</svg>
		);
	};

	return (
		<div className={styles.card}>
			<div className={styles.cardHeader}>
				<div className={styles.label}>PONG</div>
				<div className={styles.status}>
					{connected ? 'ONLINE' : 'OFFLINE'}
				</div>
			</div>

			<div className={styles.row}>
				<button className={styles.button} onClick={handleConnect} disabled={connected}>
					CONNEXION
				</button>
				<button className={`${styles.button} ${styles.secondary}`} onClick={handleDisconnect} disabled={!connected}>
					DÉCONNEXION
				</button>
				
				<div className={styles.inputGroup}>
					<input
						className={styles.input}
						type="text"
						value={playerName}
						onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
						placeholder="PLAYER 1"
						disabled={!connected}
						maxLength={10}
					/>
				</div>
			</div>

			<div className={styles.row}>
				<div className={styles.inputGroup}>
					<input
						className={styles.input}
						type="text"
						value={joinInput}
						onChange={(e) => setJoinInput(e.target.value)}
						placeholder="MATCH ID"
						disabled={!connected}
					/>
				</div>
				<button className={styles.button} onClick={handleCreate} disabled={!connected || Boolean(activeMatch)}>
					START GAME
				</button>
				<button className={`${styles.button} ${styles.secondary}`} onClick={handleJoin} disabled={!connected}>
					JOIN GAME
				</button>
			</div>

			{lastError && <div className={styles.error}>ERROR: {lastError}</div>}

			<div className={styles.board}>
				{/* Note : J'ai retiré la div de score externe pour utiliser celle du SVG */}
				{renderCanvas(pongState)}

				<div className={styles.infos}>
					<span>ID: {matchId || '---'}</span>
					<span>STATE: {pongState?.status || 'WAITING'}</span>
				</div>
			</div>
		</div>
	);
}