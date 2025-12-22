import GameCanva from '@/components/gameCanva';
import Navbar from '@/components/header/Navbar.server';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';
import { getAuthStatus } from './api/getAuthStatus';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home(props: Props) {
  const searchParams = await props.searchParams;
  const status = await getAuthStatus();
  const userName = status.authenticated ? status.username : 'Joueur';

  const langParam = searchParams.lang;
  const paramValue = Number(langParam);

  const currentLang: LangKey = (langParam && ALL_LANGUAGES[paramValue])
      ? (paramValue as LangKey)
      : 1;

  return (
    <main className="game-container">
      <Navbar />
      <div className="canvas-wrapper">
        <GameCanva userName={userName} initialLang={currentLang} />
      </div>
    </main>
  );
}
