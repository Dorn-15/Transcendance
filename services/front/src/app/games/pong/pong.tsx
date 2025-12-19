"use client";

import { useCallback, useEffect, useState, useRef } from 'react';
import { useSocket } from '@/app/context/socketProvider';
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

export function Pong({ userName = 'GUEST', texts }: PongProps) {
    const { socket, isConnected } = useSocket();
    const [isMobile, setIsMobile] = useState(false);

    // --- REF pour stocker l'ID actuel sans re-déclencher le useEffect ---
    const matchIdRef = useRef<string>('');
    const isGameIntentional = useRef(false);

	const [matchId, setMatchId] = useState<string>('');
	const [joinInput, setJoinInput] = useState<string>('');
	const [pongState, setPongState] = useState<PongState | null>(null);
	const [lastError, setLastError] = useState<string | null>(null);
	
	const activeMatch = pongState && pongState.status !== 'ended';

    // Synchronisation State -> Ref
    useEffect(() => {
        matchIdRef.current = matchId;
    }, [matchId]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (!socket) return;

        console.log("🎮 Pong: MOUNT");

        // 1. Reset initial
        isGameIntentional.current = false;
        setPongState(null);
        setMatchId('');
        matchIdRef.current = '';
        
        // Sécurité : on s'assure qu'on n'est pas considéré comme actif ailleurs
        socket.emit('pong:leave');

        const onPongState = (state: PongState) => {
            if (!isGameIntentional.current) return;
            setPongState(state);
            setMatchId(state.matchId); // La Ref sera mise à jour via l'autre useEffect
        };

        const onPongError = (msg: string) => {
            if (!isGameIntentional.current) return;
            setLastError(msg);
        };

        socket.on('pong:state', onPongState);
        socket.on('pong:error', onPongError);

        // --- C'EST ICI QUE ÇA SE JOUE (UNMOUNT) ---
        return () => {
            console.log("🎮 Pong: UNMOUNT - Triggering PAUSE");
            
            // On récupère le vrai ID de la partie en cours grâce à la REF
            const currentMatchId = matchIdRef.current;

            // On envoie un événement explicite au serveur pour dire "Je sors de l'écran"
            // Le serveur DOIT traiter cet événement comme une mise en PAUSE.
            socket.emit('pong:leave', { matchId: currentMatchId }); 
            
            isGameIntentional.current = false;
            socket.off('pong:state', onPongState);
            socket.off('pong:error', onPongError);
        };
    }, [socket]); // Dépendance uniquement au socket


	const handleCreate = useCallback((): void => {
		if (!socket || !isConnected) return;
        isGameIntentional.current = true;
        setLastError(null);

		socket.emit('pong:create', { player: userName }, (res: any) => {
			if (res?.error) { setLastError(res.error); isGameIntentional.current = false; }
			if (res?.matchId) { setMatchId(res.matchId); setJoinInput(res.matchId); }
			if (res?.state) setPongState(res.state);
		});
	}, [userName, socket, isConnected]);

	const handleJoin = useCallback((): void => {
		if (!socket || !isConnected) return;
        isGameIntentional.current = true;
        setLastError(null);

		const targetId = joinInput ? extractMatchId(joinInput) : matchId;
		const normalizedMatchId = targetId && targetId.trim() !== '' ? targetId : undefined;

		socket.emit('pong:join', { matchId: normalizedMatchId, player: userName }, (res: any) => {
			if (res?.error) { setLastError(res.error); isGameIntentional.current = false; }
			if (res?.matchId) setMatchId(res.matchId);
			if (res?.state) setPongState(res.state);
		});
	}, [joinInput, matchId, userName, socket, isConnected]);

	const handleMove = useCallback((direction: 'up' | 'down' | 'none'): void => {
		if (!socket || !matchId || !isConnected) return;
		socket.emit('pong:move', { matchId, player: userName, direction });
	}, [matchId, userName, socket, isConnected]);

	// --- KEYBOARD & TOUCH (Inchangé) ---
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

	const handleTouchStart = (dir: 'up' | 'down') => (e: React.PointerEvent) => { e.preventDefault(); handleMove(dir); };
	const handleTouchEnd = (e: React.PointerEvent) => { e.preventDefault(); handleMove('none'); };

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
			<div className={styles.cardHeader}>
				<div className={styles.label}>
					{texts.welcome}: <span className={styles.highlight}>{userName}</span>
				</div>
				<div className={`${styles.status} ${isConnected ? styles.online : styles.offline}`}>
					{isConnected ? 'ONLINE' : 'OFFLINE'}
				</div>
			</div>

			<div className={styles.controlsRow}>
				<input className={styles.input} type="text" value={joinInput} onChange={(e) => setJoinInput(e.target.value)} placeholder="MATCH ID" disabled={!isConnected} />
				<div className={styles.buttonGroup}>
					<button className={styles.button} onClick={handleCreate} disabled={!isConnected || Boolean(activeMatch)}>{texts.create}</button>
					<button className={`${styles.button} ${styles.secondary}`} onClick={handleJoin} disabled={!isConnected}>{texts.join}</button>
				</div>
			</div>

			{lastError && <div className={styles.error}>{texts.error} {lastError}</div>}

			<div className={styles.gameArea}>
				<div className={styles.boardWrapper}>
					{renderCanvas(pongState)}
				</div>
				{(activeMatch || isMobile) && (
					<div className={styles.mobileControls}>
						<button className={styles.controlBtn} onPointerDown={handleTouchStart('up')} onPointerUp={handleTouchEnd} onPointerLeave={handleTouchEnd}>▲</button>
						<div className={styles.spacer}></div>
						<button className={styles.controlBtn} onPointerDown={handleTouchStart('down')} onPointerUp={handleTouchEnd} onPointerLeave={handleTouchEnd}>▼</button>
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