import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';
import GameOverlayClient from './GameOverlayClient';
import { getAuthStatus } from '@/app/api/getAuthStatus';

type PageProps = {
    params: Promise<{ gameId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: PageProps) {
    const searchParams = await props.searchParams;
	const status = await getAuthStatus();
	const userName = status.authenticated ? status.username : 'GUEST';

    const rawLang = searchParams.lang;
    const langId = Number(rawLang);

    const safeLangId: LangKey = (langId && ALL_LANGUAGES[langId])
        ? (langId as LangKey)
        : 1;

    const texts = ALL_LANGUAGES[safeLangId].defaultInfo;

    return <GameOverlayClient userName={userName} texts={texts} />;
}
