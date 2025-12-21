'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { GameInfo } from '@/utils/languageData';
import './GameOverlay.css';

const Pong = dynamic(
	() => import('@/app/games/pong/pong').then((mod) => mod.Pong),
	{ ssr: false }
);
const BreakoutPlaceholder = dynamic(
	() => import('@/app/games/breakout/Breakout'),
	{ ssr: false }
);
const SpaceInvadersPlaceholder = dynamic(
	() => import('@/app/games/space-invaders/SpaceInvaders'),
	{ ssr: false }
);

type GameOverlayProps = {
	gameId: string;
	closeLabel: string;
	onClose: () => void;
	userName: string;
	texts: GameInfo;
};

export default function GameOverlay({
	gameId,
	closeLabel,
	onClose,
	userName,
	texts
}: GameOverlayProps) {
	const frameRef = useRef<HTMLIFrameElement>(null);

	// handle the navigation (back / escape)
	useEffect(() => {
		const handlePopState = () => {
			onClose();
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape')
				onClose();
		};

		window.addEventListener('popstate', handlePopState);
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('popstate', handlePopState);
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [onClose]);

	useEffect(() => {
		const timer = requestAnimationFrame(() => {
			frameRef.current?.contentWindow?.focus();
		});

		return () => {
			cancelAnimationFrame(timer);
		};
	}, []);

	// Game selection logic
	const renderGameContent = () => {
		const id = gameId ? gameId.toLowerCase().trim() : 'pong';

		switch (id) {
			case 'pong':
				return <Pong userName={userName} texts={texts} />;
			case 'breakout':
				return <BreakoutPlaceholder texts={texts} />;
			case 'space-invaders':
				return <SpaceInvadersPlaceholder texts={texts} />;

			default:
				return (
					<div style={{ color: 'white', textAlign: 'center', fontFamily: 'monospace' }}>
						<h2>GAME NOT FOUND</h2>
						<p>ID: {gameId}</p>
					</div>
				);
		}
	};

	return (
		<main className="game-overlay-page">
			<div className="game-overlay">
				<div className="game-overlay__frame">
					{renderGameContent()}
					<button className="game-overlay_close" onClick={onClose}>
						{closeLabel}
					</button>
				</div>
			</div>
		</main>
	);
}
