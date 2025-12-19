'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import GameOverlay from '@/components/play/GameOverlay';
import { ALL_LANGUAGES, LangKey, GameInfo } from '@/utils/languageData';

export type GatewayConfig = {
	origin: string;
	path: string;
};

function getGatewayConfig(env: NodeJS.ProcessEnv): GatewayConfig {
	// Ici, on force la configuration locale pour le développement.
    // Vous pourrez réactiver la logique des variables d'environnement (process.env) 
    // plus tard si besoin de déployer.
	return {
		origin: 'http://localhost:4006',
		path: '/socket.io',
	};
}

interface GameOverlayClientProps {
	userName: string;
	texts: GameInfo; // Les textes traduits reçus du Serveur (page.tsx)
}

export default function GameOverlayClient({ userName, texts }: GameOverlayClientProps) {
	const router = useRouter();
	const env = process.env as NodeJS.ProcessEnv;
	const gatewayConfig = getGatewayConfig(env);
	
    const searchParams = useSearchParams();
	const params = useParams<{ gameId: string }>();

	// On récupère la langue actuelle depuis l'URL pour gérer le bouton "Retour" correctement
	const langId = useMemo<LangKey>(() => {
		const rawLang = searchParams.get('lang');
		const parsed = rawLang ? parseInt(rawLang, 10) : 1;
		if (ALL_LANGUAGES[parsed]) return parsed as LangKey;
		return 1;
	}, [searchParams]);

	// Le label du bouton provient de la traduction (ex: "QUITTER LA BORNE")
	const closeLabel = texts.leave;

	const handleClose = () => {
        // On redirige vers l'accueil en conservant la langue choisie
		const target = `/?lang=${langId}`;
		router.push(target);
	};

    // On récupère l'ID du jeu (ex: "pong", "breakout", "space-invaders")
	const gameId = params?.gameId ?? '';

	return (
		<GameOverlay
			gameId={gameId}
			closeLabel={closeLabel}
			onClose={handleClose}
			gatewayConfig={gatewayConfig}
			userName={userName}
			texts={texts} 
		/>
	);
}