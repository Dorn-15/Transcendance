'use client'; // 1. Indispensable pour les hooks (useState, useRouter)

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import './LogIn.css';

// Plus besoin d'interface de props car page.tsx n'envoie rien.
export default function LogIn() {
    const router = useRouter();

    const [usernameInput, setUsernameInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Tu peux gérer la langue ici en interne si besoin avec un useState

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
                
                // 2. Rafraîchit la route actuelle. 
                // Cela va relancer la fonction `Home()` dans page.tsx sur le serveur,
                // vérifier le cookie, et afficher le jeu.
                router.refresh(); 
            } else {
                alert("Login failed");
                setIsSubmitting(false); // Réactive le bouton si échec
            }
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    return (
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
                        {/* Suppression du bouton Cancel car on ne peut pas fermer la page de login si on n'est pas connecté */}
                        <button type="submit" className="confirm-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Loading...' : 'Enter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}