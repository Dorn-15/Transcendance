'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';
import SettingsView from './views/SettingsView';
import SocialView from './views/SocialView';
import StatsView from './views/StatsView';
import './GameUi.css';

export default function GameUI() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentLang, setCurrentLang] = useState<LangKey>(1);
    const [currentView, setCurrentView] = useState<'menu' | 'settings' | 'social' | 'stats'>('menu');

    useEffect(() => {
        const langParam = searchParams.get('lang');
        if (langParam) {
            const parsed = parseInt(langParam);
            if (parsed >= 1 && parsed <= 3) {
                setCurrentLang(parsed as LangKey);
            }
        }
    }, [searchParams]);


    const changeLanguage = (langId: LangKey) => {
        setCurrentLang(langId);
        router.push(`/?lang=${langId}`, { scroll: false });
    };

    const texts = ALL_LANGUAGES[currentLang].defaultInfo;
    const backToMenu = () => setCurrentView('menu');

    return (
        <div className="ui-layer">
            <div className="title-overlay">
                <div className="main-title">{texts.trans}</div>

                <nav className="main-menu">
                    <button onClick={() => setCurrentView('settings')}>{texts.param}</button>
                    <button onClick={() => setCurrentView('social')}>{texts.social}</button>
                    <button onClick={() => setCurrentView('stats')}>{texts.stat}</button>
                </nav>
            </div>

            {currentView !== 'menu' && (
                <div className="blur-overlay">
                    {currentView === 'settings' && (

                        <SettingsView 
                            onClose={backToMenu} 
                            currentLang={currentLang}
                            onLanguageChange={changeLanguage}
                        />
                    )}
                    {currentView === 'social' && (
                        <SocialView 
                            onClose={backToMenu}
                            currentLang={currentLang} />
                    )}
                    {currentView === 'stats' && (
                        <StatsView 
                            onClose={backToMenu}
                            currentLang={currentLang} />
                    )}
                </div>
            )}
        </div>
    );
}