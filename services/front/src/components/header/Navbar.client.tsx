'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';

import { LogOut } from '../../app/logout/logout';

import SettingsView from '../views/SettingsView';
import SocialView from '../views/SocialView';
import LegalView from '../views/LegalView'; // Changé de StatsView à LegalView

import './Navbar.css';

interface NavbarClientProps {
    userName: string;
}

export default function NavbarClient({ userName }: NavbarClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Calcul de la langue
    const langParam = searchParams.get('lang');
    const paramValue = Number(langParam);
    const currentLang: LangKey = (langParam && ALL_LANGUAGES[paramValue]) 
        ? (paramValue as LangKey) 
        : 1;

    // État des vues (modales) - 'stats' remplacé par 'legal'
    const [currentView, setCurrentView] = useState<'menu' | 'settings' | 'social' | 'legal'>('menu');
    
    // NOUVEAU : État pour le menu mobile latéral
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    // Fonction pour ouvrir une vue et fermer le menu mobile en même temps
    const openViewFromMobile = (view: 'settings' | 'social' | 'legal') => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <header>
                <div className="title-overlay">
                    {/* Bouton Hamburger (Visible uniquement sur Mobile via CSS) */}
                    <button 
                        className="mobile-menu-btn" 
                        onClick={() => setIsMobileMenuOpen(true)}
                        aria-label="Open Menu"
                    >
                        ☰
                    </button>

                    <div className="main-title">{texts.trans}</div>

                    {/* Navigation Desktop (Cachée sur Mobile via CSS) */}
                    <nav className="main-menu desktop-only">
                        <button onClick={() => setCurrentView('settings')}>{texts.param}</button>
                        <button onClick={() => setCurrentView('social')}>{texts.social}</button>
                        <button onClick={() => setCurrentView('legal')}>{texts.legal}</button>
                    </nav>
                    
                    {/* User Info Desktop (Cachée sur Mobile via CSS) */}
                    <div className="user-cluster desktop-only">
                            <div className="user-info">
                                <span className="user-label">{texts.connectedAs}</span>
                                <span className="user-name">{userName}</span>
                            </div>
                            
                            <button className="sign-out-btn" onClick={handleLogout}>
                                Sign out
                            </button>
                    </div>
                </div>
            </header>

            {/* --- MENU LATÉRAL MOBILE --- */}
            <div className={`mobile-sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>
            
            <div className={`mobile-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <button className="mobile-close-btn" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
                
                <div className="mobile-user-section">
                    <span className="mobile-user-label">{texts.connectedAs}</span>
                    <span className="mobile-user-name">{userName}</span>
                </div>

                <nav className="mobile-nav">
                    <button onClick={() => openViewFromMobile('settings')}>{texts.param}</button>
                    <button onClick={() => openViewFromMobile('social')}>{texts.social}</button>
                    <button onClick={() => openViewFromMobile('legal')}>{texts.legal}</button>
                </nav>

                <button className="mobile-logout-btn" onClick={handleLogout}>
                    Sign out
                </button>
            </div>


            {/* --- MODALES (Settings, Social, Legal) --- */}
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
                    {currentView === 'legal' && (
                        <LegalView
                            onClose={backToMenu}
                            currentLang={currentLang} 
                        />
                    )}
                </div>
            )}
        </>
    );
}