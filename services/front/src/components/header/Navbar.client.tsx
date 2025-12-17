'use client';

import { useState, useEffect } from 'react'; // Removed FormEvent
import { useRouter, useSearchParams } from 'next/navigation';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';
import Login from '../views/LogIn'
import SettingsView from '../views/SettingsView';
import SocialView from '../views/SocialView';
import StatsView from '../views/StatsView';
import './Navbar.css';

type AuthStatus =
    | { authenticated: false }
    | { authenticated: true; username: string };

interface NavbarClientProps {
    authStatus: AuthStatus;
}

export default function NavbarClient({authStatus}: NavbarClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Navigation state
    const [currentLang, setCurrentLang] = useState<LangKey>(1);
    const [currentView, setCurrentView] = useState<'menu' | 'settings' | 'social' | 'stats'>('menu');

    // Auth UI State
    // We only need the visibility boolean here. The form logic is now inside <Login />
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);

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
                        {authStatus.authenticated ? (
                            <div className="user-info">
                                <span className="user-label">Signed in as</span>
                                <span className="user-name">{authStatus.username}</span>
                            </div>
                        ) : (
                            <button 
                                className="sign-in-btn" 
                                onClick={() => setLoginModalOpen(true)}
                            >
                                Sign In
                            </button>
                        )}
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
                        currentLang={currentLang} />
                    )}
                    {currentView === 'stats' && (
                        <StatsView
                        onClose={backToMenu}
                        currentLang={currentLang} />
                    )}
                </div>
            )}

            {/* Login Modal - Render conditionally and pass props */}
            {isLoginModalOpen && (
                <Login 
                    onClose={() => setLoginModalOpen(false)} 
                    currentLang={currentLang} 
                    onLanguageChange={changeLanguage} 
                />
            )}
        </>
    );
}