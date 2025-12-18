'use client';

import { useEffect, useRef } from 'react';
import './GameOverlay.css';
import {Pong} from '@/app/games/pong/pong';
import { GatewayConfig } from '@/app/play/[gameId]/page';
type	GameOverlayProps = {
	gameId: string;
	closeLabel: string;
	gatewayConfig: GatewayConfig;
	onClose: () => void;
};

export default function GameOverlay({ gameId, closeLabel, onClose, gatewayConfig }: GameOverlayProps) {
	const	frameRef = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		const	handlePopState = () => {
			onClose();
		};

		const	handleKeyDown = (event: KeyboardEvent) => {
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
		const	timer = requestAnimationFrame(() => {
			frameRef.current?.contentWindow?.focus();
		});

		return () => {
			cancelAnimationFrame(timer);
		};
	}, []);

	return (
      <main className="game-overlay-page">
          <div className="game-overlay">
              {/* ON AJOUTE LE CADRE ICI */}
              <div className="game-overlay__frame">
                  <Pong gatewayConfig={gatewayConfig} />
				  <button className="game-overlay__close" onClick={onClose}>
                  	{closeLabel}
                  </button>
              </div>
              

          </div>
      </main>
    );
}

