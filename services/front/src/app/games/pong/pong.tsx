"use client";

import { useCallback, useEffect, useState, useRef } from 'react';
import { useSocket } from '@/app/context/socketProvider';
import type { PongState } from '@transcendance/pong';
import type { GameInfo } from '@/utils/languageData';
import './pong.css';

type PongProps = {
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

function extractErrorMessage(raw: unknown): string {
	if (!raw)
		return 'Unknown error';
	if (typeof raw === 'string') {
		try {
			const	parsed = JSON.parse(raw);
			if (parsed?.message && typeof parsed.message === 'string')
				return parsed.message;
		} catch { }
		return raw;
	}
	if (typeof raw === 'object' && 'message' in raw) {
		const	message = (raw as { message?: unknown }).message;
		if (typeof message === 'string')
			return message;
	}
	return 'Unknown error';
}

export function Pong({ userName = 'GUEST', texts }: PongProps) {
	const { socket, isConnected } = useSocket();
	const [isMobile, setIsMobile] = useState(false);

	const matchIdRef = useRef<string>('');
	const isGameIntentional = useRef(false);

	const [matchId, setMatchId] = useState<string>('');
	const [joinInput, setJoinInput] = useState<string>('');
	const [pongState, setPongState] = useState<PongState | null>(null);
	const [lastError, setLastError] = useState<string | null>(null);
	const [didCopyId, setDidCopyId] = useState<boolean>(false);
	const [didRequestRestart, setDidRequestRestart] = useState<boolean>(false);

	const isEnded = pongState?.status === 'ended';
	const canMove = pongState?.status === 'running';

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
		let				timerId: ReturnType<typeof setTimeout>;

		if (!didCopyId)
			return;
		timerId = setTimeout(() => setDidCopyId(false), 1200);
		return () => clearTimeout(timerId);
	}, [didCopyId]);

	useEffect(() => {
		if (!socket)
			return;

		isGameIntentional.current = false;
		setPongState(null);
		setMatchId('');
		matchIdRef.current = '';
		setDidRequestRestart(false);

		const onPongState = (state: PongState) => {
			if (!isGameIntentional.current) return;
			setPongState(state);
			setMatchId(state.matchId);
			if (state.status !== 'ended')
				setDidRequestRestart(false);
		};

		const onPongError = (msg: string) => {
			if (!isGameIntentional.current) return;
			setLastError(msg);
		};

		const onPongClosed = (payload: { matchId: string; reason: 'leave' | 'stop' | 'disconnect' }) => {
			if (payload?.matchId && matchIdRef.current && payload.matchId !== matchIdRef.current)
				return;
			isGameIntentional.current = false;
			setPongState(null);
			setMatchId('');
			matchIdRef.current = '';
			setJoinInput('');
			setDidRequestRestart(false);
			setLastError(null);
		};

		socket.on('pong:state', onPongState);
		socket.on('pong:error', onPongError);
		socket.on('pong:closed', onPongClosed);

		return () => {
			const currentMatchId = matchIdRef.current;
			if (currentMatchId)
				socket.emit('pong:leave', { matchId: currentMatchId });

			isGameIntentional.current = false;
			socket.off('pong:state', onPongState);
			socket.off('pong:error', onPongError);
			socket.off('pong:closed', onPongClosed);
		};
	}, [socket]);


	const handleCreate = useCallback((): void => {
		if (!socket || !isConnected) return;
		isGameIntentional.current = true;
		setLastError(null);
		setDidRequestRestart(false);

		socket.emit('pong:create', { player: userName }, (res: any) => {
			if (res?.error) {
				const	message = extractErrorMessage(res.error);
				setLastError(message);
				isGameIntentional.current = false;
			}
			if (res?.matchId) { setMatchId(res.matchId); setJoinInput(res.matchId); }
			if (res?.state) setPongState(res.state);
		});
	}, [userName, socket, isConnected]);

	const handleJoin = useCallback((): void => {
		if (!socket || !isConnected)
			return;
		isGameIntentional.current = true;
		setLastError(null);
		setDidRequestRestart(false);

		const targetId = joinInput ? extractMatchId(joinInput) : matchId;
		const normalizedMatchId = targetId && targetId.trim() !== '' ? targetId : undefined;

		socket.emit('pong:join', { matchId: normalizedMatchId, player: userName }, (res: any) => {
			if (res?.error) {
				const	message = extractErrorMessage(res.error);
				setLastError(message);
				isGameIntentional.current = false;
			}
			if (res?.matchId) setMatchId(res.matchId);
			if (res?.state) setPongState(res.state);
		});
	}, [joinInput, matchId, userName, socket, isConnected]);

	const handleMove = useCallback((direction: 'up' | 'down' | 'none'): void => {
		if (!socket || !matchId || !isConnected) return;
		socket.emit('pong:move', { matchId, player: userName, direction });
	}, [matchId, userName, socket, isConnected]);

	const handleExit = useCallback((): void => {
		const currentMatchId = matchIdRef.current;
		if (!socket || !isConnected || !currentMatchId) return;
		socket.emit('pong:leave', { matchId: currentMatchId });
	}, [socket, isConnected]);

	const handleRestart = useCallback((): void => {
		const currentMatchId = matchIdRef.current;
		if (!socket || !isConnected || !currentMatchId) return;
		setDidRequestRestart(true);
		socket.emit('pong:restart', { matchId: currentMatchId, player: userName }, (res: any) => {
			if (res?.error) {
				const	message = extractErrorMessage(res.error);
				setLastError(message);
			}
		});
	}, [socket, isConnected, userName]);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.repeat) return;
			if (!canMove) return;
			if (e.key === 'ArrowUp') handleMove('up');
			else if (e.key === 'ArrowDown') handleMove('down');
		};
		const onKeyUp = (e: KeyboardEvent) => {
			if (!canMove) return;
			if (e.key === 'ArrowUp' || e.key === 'ArrowDown') handleMove('none');
		};
		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);
		return () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
		};
	}, [handleMove, canMove]);

	const handleTouchStart = (dir: 'up' | 'down') => (e: React.PointerEvent) => { e.preventDefault(); handleMove(dir); };
	const handleTouchEnd = (e: React.PointerEvent) => { e.preventDefault(); handleMove('none'); };

	const handleCopyMatchId = useCallback(async (): Promise<void> => {
		const textToCopy = matchId.trim();
		if (textToCopy === '')
			return;
		try {
			await navigator.clipboard.writeText(textToCopy);
			setDidCopyId(true);
		} catch { }
	}, [matchId]);

	const renderCanvas = (state: PongState | null): React.ReactNode => {
		if (!state) {
			return (
				<div className="tagline">
					<p>{texts.coin}</p>
					<p className="subTagline">{texts.CreateOrJoin}</p>
					<div className="rulesContainer">
						<p>{texts.firstToFive}</p>
						{!isMobile && <p>{texts.useArrows}</p>}
					</div>
				</div>
			);
		}
		const VIEWPORT_WIDTH = 800;
		const VIEWPORT_HEIGHT = 600;
		const scaleX = VIEWPORT_WIDTH / state.width;
		const scaleY = VIEWPORT_HEIGHT / state.height;

		return (
			<svg className="canvas" viewBox={`0 0 ${VIEWPORT_WIDTH} ${VIEWPORT_HEIGHT}`} preserveAspectRatio="xMidYMid meet" shapeRendering="crispEdges">
				<text
					x={VIEWPORT_WIDTH / 4}
					y={100} fill="white" fontSize="80"
					fontFamily="'Press Start 2P', monospace"
					textAnchor="middle">{state.scoreLeft}
				</text>
				<text
					x={(VIEWPORT_WIDTH / 4) * 3}
					y={100} fill="white" fontSize="80"
					fontFamily="'Press Start 2P', monospace"
					textAnchor="middle">{state.scoreRight}
				</text>
				<line
					x1={VIEWPORT_WIDTH / 2}
					y1={0}
					x2={VIEWPORT_WIDTH / 2}
					y2={VIEWPORT_HEIGHT}
					stroke="white" strokeWidth={5}
					strokeDasharray="15, 15"
				/>
				<rect
					x={(state.paddleThickness - 10 * scaleX) * scaleX}
					y={state.leftY * scaleY}
					width={10 * scaleX}
					height={state.paddleHeight * scaleY}
					fill="white"
				/>
				<rect
					x={VIEWPORT_WIDTH - state.paddleThickness * scaleX}
					y={state.rightY * scaleY}
					width={10 * scaleX}
					height={state.paddleHeight * scaleY}
					fill="white"
				/>
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
		<div className="card">
			<div className="cardHeader">
				<div className="label">
					{texts.welcome}: <span className="highlight">{userName}</span>
				</div>
				<div className={`status ${isConnected ? 'online' : 'offline'}`}>
					{isConnected ? 'ONLINE' : 'OFFLINE'}
				</div>
			</div>

			{!pongState && (
				<div className="controlsRow">
					<input className="input" type="text" value={joinInput} onChange={(e) => setJoinInput(e.target.value)} placeholder="MATCH ID" disabled={!isConnected} />
					<div className="buttonGroup">
						<button className="button" onClick={handleCreate} disabled={!isConnected}>{texts.create}</button>
						<button className="button secondary" onClick={handleJoin} disabled={!isConnected}>{texts.join}</button>
					</div>
				</div>
			)}

			{lastError && <div className="error">{texts.error} {lastError}</div>}


			<div className="gameArea">
				<div className="boardWrapper">
					{renderCanvas(pongState)}
				</div>
				{(canMove && isMobile) && (
					<div className="mobileControls">
						<button className="controlBtn" onPointerDown={handleTouchStart('up')} onPointerUp={handleTouchEnd} onPointerLeave={handleTouchEnd}>▲</button>
						<div className="spacer"></div>
						<button className="controlBtn" onPointerDown={handleTouchStart('down')} onPointerUp={handleTouchEnd} onPointerLeave={handleTouchEnd}>▼</button>
					</div>
				)}
				<div className="infos">
					<button
						className={`idCopy ${matchId ? 'clickable' : 'disabled'}`}
						type="button"
						onClick={handleCopyMatchId}
						disabled={!matchId}
						title={matchId ? (didCopyId ? 'Copied!' : 'Click to copy') : 'No match id'}
					>
						ID: {matchId || '------'}{didCopyId ? ' (COPIED)' : ''}
					</button>
					<span>{texts.state} {pongState?.status || texts.waiting}</span>
				</div>

				{isEnded && (
					<div className="controlsRow">
						<div className="buttonGroup">
							<button className="button secondary" onClick={handleExit} disabled={!isConnected}>EXIT</button>
							<button className="button" onClick={handleRestart} disabled={!isConnected || didRequestRestart}>
								{didRequestRestart ? 'WAITING RESTART...' : 'RESTART'}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}