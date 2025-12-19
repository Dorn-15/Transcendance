'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';

import { LogOut } from '../../app/logout/logout';

import SettingsView from '../views/SettingsView';
import SocialView from '../views/SocialView';
import StatsView from '../views/StatsView';

import './Navbar.css';

// Ajout de l'interface pour les props
interface NavbarClientProps {
    userName: string;
}

export default function NavbarClient({ userName }: NavbarClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 1. On calcule la langue directement depuis l'URL à chaque rendu
    const langParam = searchParams.get('lang');
    const paramValue = Number(langParam);
    
    // Si le paramètre est valide (existe dans ALL_LANGUAGES), on l'utilise, sinon par défaut 1
    const currentLang: LangKey = (langParam && ALL_LANGUAGES[paramValue]) 
        ? (paramValue as LangKey) 
        : 1;

    // Seule la vue a besoin d'un useState local
    const [currentView, setCurrentView] = useState<'menu' | 'settings' | 'social' | 'stats'>('menu');

    // 2. La fonction pour changer de langue met simplement à jour l'URL
    const changeLanguage = (langId: LangKey) => {
        router.push(`/?lang=${langId}`, { scroll: false });
    };

    const handleLogout = async () => {
        try {
            await LogOut();
            router.refresh();
            router.push(`/?lang=${currentLang}`); 
        } catch (error) {
            if ((error as Error).message !== 'NEXT_REDIRECT') {
                console.error("Logout failed:", error);
            }
        }
    };

    const texts = ALL_LANGUAGES[currentLang].defaultInfo;
    const backToMenu = () => setCurrentView('menu');

    return (
        <>
            <header>
                <div className="title-overlay">
                    <div className="main-title">{texts.trans}</div>

                    <nav className="main-menu">
                        <button onClick={() => setCurrentView('settings')}>{texts.param}</button>
                        <button onClick={() => setCurrentView('social')}>{texts.social}</button>
                        <button onClick={() => setCurrentView('stats')}>{texts.stat}</button>
                    </nav>
                    
                    <div className="user-cluster">
                            <div className="user-info">
                                <span className="user-label">{texts.connectedAs}</span>
                                {/* On utilise ici la prop userName transmise par le serveur */}
                                <span className="user-name">{userName}</span>
                            </div>
                            
                            <button className="sign-out-btn" onClick={handleLogout}>
                                Sign out
                            </button>
                    </div>
                </div>
            </header>

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
                            currentLang={currentLang} 
                        />
                    )}
                    {currentView === 'stats' && (
                        <StatsView
                            onClose={backToMenu}
                            currentLang={currentLang} 
                        />
                    )}
                </div>
            )}
        </>
    );
}