'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import GameOverlay from '@/components/play/GameOverlay';
import { ALL_LANGUAGES, LangKey, GameInfo } from '@/utils/languageData';
interface GameOverlayClientProps {
	userName: string;
	texts: GameInfo;
}

export default function GameOverlayClient({ userName, texts }: GameOverlayClientProps) {
	const router = useRouter();
	const env = process.env as NodeJS.ProcessEnv;

	const searchParams = useSearchParams();
	const params = useParams<{ gameId: string }>();

	// take the lang from the url
	const langId = useMemo<LangKey>(() => {
		const rawLang = searchParams.get('lang');
		const parsed = rawLang ? parseInt(rawLang, 10) : 1;
		if (ALL_LANGUAGES[parsed]) return parsed as LangKey;
		return 1;
	}, [searchParams]);
	const closeLabel = texts.leave;

	// redirect with the chosen lang
	const handleClose = () => {
		const target = `/?lang=${langId}`;
		router.push(target);
	};

	// take the game id from the url
	const gameId = params?.gameId ?? '';

	return (
		<GameOverlay
			gameId={gameId}
			closeLabel={closeLabel}
			onClose={handleClose}
			userName={userName}
			texts={texts}
		/>
	);
}
