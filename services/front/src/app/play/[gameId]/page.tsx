// src/app/play/[gameId]/page.tsx
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData'; // Vérifiez l'import LangKey
import GameOverlayClient from './GameOverlayClient';
import { getAuthStatus } from '@/app/api/getAuthStatus';

// Définition du type pour les props de page en Next.js récent
type PageProps = {
    params: Promise<{ gameId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: PageProps) {
    // 1. On attend que les searchParams soient résolus (Fix pour Next.js 15+)
    const searchParams = await props.searchParams;
	const status = await getAuthStatus();
	const userName = status.authenticated ? status.username : 'GUEST';

    // 2. On récupère la langue
    const rawLang = searchParams.lang;
    const langId = Number(rawLang);

    // 3. Sécurité : Si langId est invalide, on prend 1
    const safeLangId: LangKey = (langId && ALL_LANGUAGES[langId])
        ? (langId as LangKey)
        : 1;

    const texts = ALL_LANGUAGES[safeLangId].defaultInfo;

    return <GameOverlayClient userName={userName} texts={texts} />;
}
