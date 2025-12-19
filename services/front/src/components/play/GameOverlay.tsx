'use client';

import { useEffect, useRef } from 'react';
import './GameOverlay.css';

// Import des composants de jeux
import { Pong } from '@/app/games/pong/pong';
import BreakoutPlaceholder from '@/app/games/breakout/Breakout';
import SpaceInvadersPlaceholder from '@/app/games/space-invaders/SpaceInvaders';

import { GatewayConfig } from '@/app/play/[gameId]/GameOverlayClient';
import { GameInfo } from '@/utils/languageData';

type GameOverlayProps = {
	gameId: string;
	closeLabel: string;
	gatewayConfig: GatewayConfig;
	onClose: () => void;
	userName: string;
	texts: GameInfo;
};

export default function GameOverlay({ 
	gameId, 
	closeLabel, 
	onClose, 
	gatewayConfig, 
	userName,
	texts 
}: GameOverlayProps) {
	const frameRef = useRef<HTMLIFrameElement>(null);

	// Gestion de la navigation (Retour / Echap)
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

	// Focus automatique (utile pour l'accessibilité)
	useEffect(() => {
		const timer = requestAnimationFrame(() => {
			frameRef.current?.contentWindow?.focus();
		});

		return () => {
			cancelAnimationFrame(timer);
		};
	}, []);

	// Logique de sélection du jeu
	const renderGameContent = () => {
		const id = gameId ? gameId.toLowerCase().trim() : 'pong';

		switch (id) {
			case 'pong':
				return (
					<Pong 
						gatewayConfig={gatewayConfig} 
						userName={userName} 
						texts={texts}
					/>
				);
			
			case 'breakout':
				// On passe texts ici
				return <BreakoutPlaceholder texts={texts} />;
			
			case 'space-invaders':
				// On passe texts ici aussi
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
					
					{/* Affichage dynamique du jeu */}
					{renderGameContent()}
					
					<button className="game-overlay__close" onClick={onClose}>
						{closeLabel}
					</button>
				</div>
			</div>
		</main>
	);
}