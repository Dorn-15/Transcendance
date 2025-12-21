'use client';

import { useState, FormEvent } from 'react';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';
import './LogIn.css';

interface NewAccountProps {
    currentLang: LangKey;
    onBack: () => void; // Fonction pour revenir au login
}

export default function NewAccount({ currentLang, onBack }: NewAccountProps) {
    const texts = ALL_LANGUAGES[currentLang].defaultInfo;
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!username.trim() || !password.trim()) return;
        
        if (password !== confirmPassword) {
            alert("Les mots de passe ne correspondent pas"); // À adapter selon vos traductions
            return;
        }

        setIsSubmitting(true);

        try {
            // Remplacez par votre endpoint de création de compte
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                alert("Compte créé avec succès !");
                onBack(); // Retour à l'écran de connexion
            } else {
                alert("Erreur lors de la création du compte");
            }
        } catch (error) {
            console.error("Register error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-overlay">
            <div className="login-box">
                {/* Titre (Nouveau Compte) */}
                <h3>Nouveau Compte</h3> 

                <form onSubmit={handleRegister}>
                    <input 
                        type="text" 
                        placeholder={texts.username} 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isSubmitting}
                        maxLength={50}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder={texts.passWord} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        maxLength={50}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Confirm Password" // Ou une clé de traduction si dispo
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isSubmitting}
                        maxLength={50}
                        required
                    />

                    <div className="login-actions column-actions">
                        <button type="submit" className="confirm-btn" disabled={isSubmitting}>
                            {isSubmitting ? '...' : texts.enter} {/* Ou "Créer" */}
                        </button>
                        
                        <button 
                            type="button" 
                            className="confirm-btn"
                            onClick={onBack}
                            disabled={isSubmitting}
                        >
                           {texts.back}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}