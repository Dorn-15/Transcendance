'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';

// Assurez-vous que le chemin d'import est correct selon votre structure
import { LogOut } from '../../app/logout/logout';

// Import des vues (modals)
import SettingsView from '../views/SettingsView';
import SocialView from '../views/SocialView';
import StatsView from '../views/StatsView';

import './Navbar.css';

export default function NavbarClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Navigation state
    const [currentLang, setCurrentLang] = useState<LangKey>(1);
    const [currentView, setCurrentView] = useState<'menu' | 'settings' | 'social' | 'stats'>('menu');

    // Synchronisation de la langue via l'URL
    useEffect(() => {
        const langParam = searchParams.get('lang');
        if (langParam) {
            const parsed = parseInt(langParam);
            if (parsed >= 1 && parsed <= 3) {
                setCurrentLang(parsed as LangKey);
            }
        }
    }, [searchParams]);

    // Changement de langue
    const changeLanguage = (langId: LangKey) => {
        setCurrentLang(langId);
        router.push(`/?lang=${langId}`, { scroll: false });
    };

    // Gestion de la déconnexion
    const handleLogout = async () => {
        try {
            // 1. Appel de la Server Action pour supprimer le cookie
            await LogOut();
            
            // 2. Rafraîchir le routeur pour vider le cache des données protégées
            router.refresh();
            
            // 3. Redirection explicite vers l'accueil (si la server action ne le fait pas déjà)
            // Cela évite aussi les erreurs visuelles si la redirection serveur échoue
            router.push(`/?lang=${currentLang}`); 
            
        } catch (error) {
            // Si LogOut contient un redirect() serveur, Next.js lance une erreur "NEXT_REDIRECT"
            // C'est un comportement normal, on peut l'ignorer ou le logger.
            // Si c'est une autre erreur, on l'affiche.
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
                                <span className="user-label">Signed in as</span>
                                <span className="user-name">someone</span>
                            </div>
                            
                            {/* CORRECTION ICI : Appel via handleLogout */}
                            <button className="sign-out-btn" onClick={handleLogout}>
                                Sign out
                            </button>
                    </div>
                </div>
            </header>

            {/* View Modals */}
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