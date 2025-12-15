'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import GameOverlay from '@/components/play/GameOverlay';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';


export type GatewayConfig = {
	origin: string;
	path: string;
};

function	getGatewayConfig(env: NodeJS.ProcessEnv): GatewayConfig {
	const	rawDomain = env.NEXT_PUBLIC_DOMAIN ?? env.DOMAIN ?? '';
	const	wsBasePath = env.NEXT_PUBLIC_WS_PATH ?? env.WS_PATH ?? '/ws';

	console.log('rawDomain', rawDomain);
	if (rawDomain === '' && typeof window !== 'undefined') {
		const	basePath = wsBasePath.replace(/\/+$/, '');

		return {
			origin: window.location.origin,
			path: `${basePath}/socket.io`,
		};
	}
	if (rawDomain !== '') {
		const	trimmedDomain = rawDomain.replace(/\/+$/, '').replace(/\/ws$/, '');

		const	origin = trimmedDomain.startsWith('http://') || trimmedDomain.startsWith('https://')
			? trimmedDomain
			: `https://${trimmedDomain}`;

		const	basePath = wsBasePath.replace(/\/+$/, '');

		return {
			origin,
			path: `${basePath}/socket.io`,
		};
	}

	return {
		origin: 'http://localhost:4006',
		path: '/socket.io',
	};
}

export default function GameOverlayPage() {
	const	router = useRouter();
	const	env = process.env as NodeJS.ProcessEnv;
	const	gatewayConfig = getGatewayConfig(env);
	const	searchParams = useSearchParams();
	const	params = useParams<{ gameId: string }>();

	const	langId = useMemo<LangKey>(() => {
		const	rawLang = searchParams.get('lang');
		const	parsed = rawLang ? parseInt(rawLang, 10) : 1;

		if (ALL_LANGUAGES[parsed])
			return parsed as LangKey;
		return 1;
	}, [searchParams]);


	const	closeLabel = ALL_LANGUAGES[langId]?.defaultInfo.leave ?? 'Exit';

	const	handleClose = () => {
		const	target = searchParams.get('lang') ? `/?lang=${langId}` : '/';
		router.push(target);
	};

	const	gameId = params?.gameId ?? '';

	return (
		<GameOverlay
			gameId={gameId}
			closeLabel={closeLabel}
			onClose={handleClose}
			gatewayConfig={gatewayConfig}
		/>
	);
}

