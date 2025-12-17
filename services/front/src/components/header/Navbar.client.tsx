'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';
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

    //navigation state
    const [currentLang, setCurrentLang] = useState<LangKey>(1);
    const [currentView, setCurrentView] = useState<'menu' | 'settings' | 'social' | 'stats'>('menu');

    // Auth UI State
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const [usernameInput, setUsernameInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        if (!usernameInput.trim()) return;

        setIsSubmitting(true);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameInput })
            });

            if (res.ok) {
                setLoginModalOpen(false);
                setUsernameInput('');
                // Refresh the current route to re-run Server Components (fetching fresh auth status)
                setTimeout(() => {
                    router.refresh();
                }, 100); 
            } else {
                alert("Login failed");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
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
                    {/* --- User Cluster --- */}
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
            {/* --- Login Modal Overlay --- */}
            {isLoginModalOpen && (
                <div className="login-overlay">
                    <div className="login-box">
                        <h3>Welcome Back</h3>
                        <form onSubmit={handleLogin}>
                            <input 
                                type="text" 
                                placeholder="Username" 
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                                disabled={isSubmitting}
                                autoFocus
                            />
                            <div className="login-actions">
                                <button type="button" onClick={() => setLoginModalOpen(false)} disabled={isSubmitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="confirm-btn" disabled={isSubmitting}>
                                    {isSubmitting ? '...' : 'Enter'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}