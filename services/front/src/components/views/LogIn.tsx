'use client'; 

import { useState, FormEvent, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { preloadAsset } from '@/utils/assetLoader';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';
import NewAccount from './newAccount'; 
import './LogIn.css';

export default function LogIn() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentLang = useMemo<LangKey>(() => {
        const langParam = searchParams.get('lang');
        const paramValue = Number(langParam);
        return (langParam && ALL_LANGUAGES[paramValue]) 
            ? (paramValue as LangKey) 
            : 1;
    }, [searchParams]);

    const texts = ALL_LANGUAGES[currentLang].defaultInfo;

    const [usernameInput, setUsernameInput] = useState('');
    const [PassWordInput, setPassWordInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        const assets = [
            "Breakout.glb",
            "Pong.glb",
            "SpaceInvaders.glb",
            "room.glb",
            "table.glb"
        ];
        assets.forEach(file => preloadAsset(file));
    }, []);

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
                setUsernameInput('');
                router.refresh(); 
                router.push(`/?lang=${currentLang}`); 
            } else {
                alert("Login failed");
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    if (isRegistering) {
        return (
            <NewAccount 
                currentLang={currentLang} 
                onBack={() => setIsRegistering(false)} 
            />
        );
    }

    return (
        <div className="login-overlay">
            <div className="login-box">
                <h3>{texts.welcome}</h3> 
                
                <form onSubmit={handleLogin}>
                    <input 
                        type="text" 
                        placeholder={texts.username} 
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        disabled={isSubmitting}
                        autoFocus
                        maxLength={50}
                    />
                    <input 
                        type="password"
                        placeholder={texts.passWord} 
                        value={PassWordInput}
                        onChange={(e) => setPassWordInput(e.target.value)}
                        disabled={isSubmitting}
                        maxLength={15}
                    />
                    
                    <div className="login-actions column-actions">
                        <button type="submit" className="confirm-btn" disabled={isSubmitting}>
                            {isSubmitting ? '...' : texts.enter}
                        </button>
                        
                        <button 
                            type="button" 
                            className="confirm-btn"
                            onClick={() => setIsRegistering(true)}
                        >
                            {texts.newAccount}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}