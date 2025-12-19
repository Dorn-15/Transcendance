"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GatewayConfig } from '@/app/play/[gameId]/GameOverlayClient';
import type { PongState } from '@transcendance/pong';
import type { GameInfo } from '@/utils/languageData';
import styles from './pong.module.css';

type PongProps = {
	gatewayConfig: GatewayConfig;
	userName: string;
	texts: GameInfo;
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
	} catch { }
	return trimmed;
}

export function Pong({ gatewayConfig, userName = 'GUEST', texts }: PongProps) {
	const socketRef = useRef<Socket | null>(null);
	
    // État pour savoir si on est sur mobile (pour afficher les contrôles tactiles)
    const [isMobile, setIsMobile] = useState(false);

	const [connected, setConnected] = useState(false);
	const [matchId, setMatchId] = useState<string>('');
	const [joinInput, setJoinInput] = useState<string>('');
	const [pongState, setPongState] = useState<PongState | null>(null);
	const [lastError, setLastError] = useState<string | null>(null);
	
	const activeMatch = pongState && pongState.status !== 'ended';

    // Détection basique du mobile au montage
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

	const requireSocket = useCallback((): Socket | null => {
		const socket = socketRef.current;
		if (!socket) {
			setLastError('Not connected');
			return null;
		}
		return socket;
	}, []);

	// --- SOCKET LOGIC ---
	const handleConnect = useCallback((): void => {
		if (socketRef.current?.connected) return;
		
		const socket = io(gatewayConfig.origin, {
			path: gatewayConfig.path,
			transports: ['websocket'],
		});
		socketRef.current = socket;

		socket.on('connect', () => { 
			setConnected(true); 
			setLastError(null); 
		});
		socket.on('disconnect', () => { setConnected(false); });
		socket.on('connect_error', (err) => { setLastError("Error: " + err.message); });
		socket.on('pong:state', (state: PongState) => { setPongState(state); setMatchId(state.matchId); });
		socket.on('pong:error', (msg: string) => { setLastError(msg); });
	}, [gatewayConfig.origin, gatewayConfig.path]);

	useEffect(() => {
		handleConnect();
		return () => {
			if (socketRef.current) socketRef.current.disconnect();
		};
	}, [handleConnect]);

	const handleCreate = useCallback((): void => {
		const socket = requireSocket();
		if (!socket) return;
		if (activeMatch) return;

		socket.emit('pong:create', { player: userName }, (res: any) => {
			if (res?.error) setLastError(res.error);
			if (res?.matchId) { setMatchId(res.matchId); setJoinInput(res.matchId); }
			if (res?.state) setPongState(res.state);
		});
	}, [activeMatch, userName, requireSocket]);

	const handleJoin = useCallback((): void => {
		const socket = requireSocket();
		if (!socket) return;
		const targetId = joinInput ? extractMatchId(joinInput) : matchId;
		const normalizedMatchId = targetId && targetId.trim() !== '' ? targetId : undefined;

		socket.emit('pong:join', { matchId: normalizedMatchId, player: userName }, (res: any) => {
			if (res?.error) setLastError(res.error);
			if (res?.matchId) setMatchId(res.matchId);
			if (res?.state) setPongState(res.state);
		});
	}, [joinInput, matchId, userName, requireSocket]);

	const handleMove = useCallback((direction: 'up' | 'down' | 'none'): void => {
		const socket = requireSocket();
		if (!socket || !matchId) return;
		socket.emit('pong:move', { matchId, player: userName, direction });
	}, [matchId, userName, requireSocket]);

	// --- KEYBOARD ---
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
		};
	}, [handleMove]);

	// --- TOUCH CONTROLS ---
	const handleTouchStart = (dir: 'up' | 'down') => (e: React.PointerEvent) => {
		e.preventDefault(); 
		handleMove(dir);
	};
	
	const handleTouchEnd = (e: React.PointerEvent) => {
		e.preventDefault();
		handleMove('none');
	};

	const renderCanvas = (state: PongState | null): React.ReactNode => {
		if (!state) {
			return (
				<div className={styles.tagline}>
					<p>{texts.coin}</p>
					<p className={styles.subTagline}>{texts.CreateOrJoin}</p>
				</div>
			);
		}

		const VIEWPORT_WIDTH = 800;
		const VIEWPORT_HEIGHT = 600;
		const scaleX = VIEWPORT_WIDTH / state.width;
		const scaleY = VIEWPORT_HEIGHT / state.height;

		return (
			<svg className={styles.canvas} viewBox={`0 0 ${VIEWPORT_WIDTH} ${VIEWPORT_HEIGHT}`} preserveAspectRatio="xMidYMid meet" shapeRendering="crispEdges">
				<text x={VIEWPORT_WIDTH / 4} y={100} fill="white" fontSize="80" fontFamily="'Press Start 2P', monospace" textAnchor="middle">{state.scoreLeft}</text>
				<text x={(VIEWPORT_WIDTH / 4) * 3} y={100} fill="white" fontSize="80" fontFamily="'Press Start 2P', monospace" textAnchor="middle">{state.scoreRight}</text>
				<line x1={VIEWPORT_WIDTH / 2} y1={0} x2={VIEWPORT_WIDTH / 2} y2={VIEWPORT_HEIGHT} stroke="white" strokeWidth={10} strokeDasharray="15, 15" />
				<rect x={(state.paddleThickness - 4 * scaleX) * scaleX} y={state.leftY * scaleY} width={15 * scaleX} height={state.paddleHeight * scaleY} fill="white" />
				<rect x={VIEWPORT_WIDTH - state.paddleThickness * scaleX} y={state.rightY * scaleY} width={15 * scaleX} height={state.paddleHeight * scaleY} fill="white" />
				<rect x={(state.ballX * scaleX) - (state.ballRadius)} y={(state.ballY * scaleY) - (state.ballRadius)} width={state.ballRadius * 2} height={state.ballRadius * 2} fill="white" />
			</svg>
		);
	};

	return (
		<div className={styles.card}>
			{/* HEADER (Pseudo + Status) */}
			<div className={styles.cardHeader}>
				<div className={styles.label}>
					{texts.welcome}: <span className={styles.highlight}>{userName}</span>
				</div>
				<div className={`${styles.status} ${connected ? styles.online : styles.offline}`}>
					{connected ? 'ONLINE' : '...'}
				</div>
			</div>

			{/* ACTIONS (Input + Buttons) */}
			<div className={styles.controlsRow}>
				<input
					className={styles.input}
					type="text"
					value={joinInput}
					onChange={(e) => setJoinInput(e.target.value)}
					placeholder="MATCH ID"
					disabled={!connected}
				/>
				<div className={styles.buttonGroup}>
					<button className={styles.button} onClick={handleCreate} disabled={!connected || Boolean(activeMatch)}>
						{texts.create}
					</button>
					<button className={`${styles.button} ${styles.secondary}`} onClick={handleJoin} disabled={!connected}>
						{texts.join}
					</button>
				</div>
			</div>

			{lastError && <div className={styles.error}>{texts.error} {lastError}</div>}

			{/* ZONE DE JEU + CONTROLES TACTILES */}
			<div className={styles.gameArea}>
				<div className={styles.boardWrapper}>
					{renderCanvas(pongState)}
				</div>
				
				{/* Contrôles tactiles (seulement si match actif ou sur mobile) */}
				{(activeMatch || isMobile) && (
					<div className={styles.mobileControls}>
						<button 
							className={styles.controlBtn} 
							onPointerDown={handleTouchStart('up')} 
							onPointerUp={handleTouchEnd}
							onPointerLeave={handleTouchEnd}
						>
							▲
						</button>
						<div className={styles.spacer}></div>
						<button 
							className={styles.controlBtn} 
							onPointerDown={handleTouchStart('down')} 
							onPointerUp={handleTouchEnd}
							onPointerLeave={handleTouchEnd}
						>
							▼
						</button>
					</div>
				)}
				
				<div className={styles.infos}>
					<span>ID: {matchId || '---'}</span>
					<span>{texts.state} {pongState?.status || texts.waiting}</span>
				</div>
			</div>
		</div>
	);
}