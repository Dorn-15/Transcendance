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
	const rawDomain = env.NEXT_PUBLIC_DOMAIN ?? env.DOMAIN ?? '';
	const wsBasePath = env.NEXT_PUBLIC_WS_PATH ?? env.WS_PATH ?? '/ws';

	if (rawDomain === '' && typeof window !== 'undefined') {
		return {
			origin: 'http://localhost:4006',
			path: '/socket.io',
		};
	}
	if (rawDomain !== '') {
		return {
			origin: 'http://localhost:4006',
			path: '/socket.io',
		};
	}

	return {
		origin: 'http://localhost:4006',
		path: '/socket.io',
	};
}

interface GameOverlayClientProps {
	userName: string;
	texts: GameInfo; // Ajout des textes récupérés en SSR
}

export default function GameOverlayClient({ userName, texts }: GameOverlayClientProps) {
	const router = useRouter();
	const env = process.env as NodeJS.ProcessEnv;
	const gatewayConfig = getGatewayConfig(env);
	const searchParams = useSearchParams();
	const params = useParams<{ gameId: string }>();

	// On garde langId uniquement pour la redirection du handleClose
	const langId = useMemo<LangKey>(() => {
		const rawLang = searchParams.get('lang');
		const parsed = rawLang ? parseInt(rawLang, 10) : 1;
		if (ALL_LANGUAGES[parsed]) return parsed as LangKey;
		return 1;
	}, [searchParams]);

	// Le label "Quitter" provient maintenant directement de l'objet texts SSR
	const closeLabel = texts.leave;

	const handleClose = () => {
		const target = searchParams.get('lang') ? `/?lang=${langId}` : '/';
		router.push(target);
	};

	const gameId = params?.gameId ?? '';

	return (
		<GameOverlay
			gameId={gameId}
			closeLabel={closeLabel}
			onClose={handleClose}
			gatewayConfig={gatewayConfig}
			userName={userName}
			texts={texts} // On transmet les textes au composant suivant
		/>
	);
}