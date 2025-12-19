'use client';

import { useEffect, useRef } from 'react';
import './GameOverlay.css';
import { Pong } from '@/app/games/pong/pong';
import { GatewayConfig } from '@/app/play/[gameId]/GameOverlayClient';
import { GameInfo } from '@/utils/languageData'; // Import du type pour les textes

type GameOverlayProps = {
	gameId: string;
	closeLabel: string;
	gatewayConfig: GatewayConfig;
	onClose: () => void;
	userName: string;
	texts: GameInfo; // Ajout de la prop texts
};

export default function GameOverlay({ 
	gameId, 
	closeLabel, 
	onClose, 
	gatewayConfig, 
	userName,
	texts // Récupération des textes
}: GameOverlayProps) {
	const frameRef = useRef<HTMLIFrameElement>(null);

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

	return (
		<main className="game-overlay-page">
			<div className="game-overlay">
				<div className="game-overlay__frame">
					{/* On transmet le userName et les texts au composant Pong */}
					<Pong 
						gatewayConfig={gatewayConfig} 
						userName={userName} 
						texts={texts}
					/>
					
					<button className="game-overlay__close" onClick={onClose}>
						{closeLabel}
					</button>
				</div>
			</div>
		</main>
	);
}