import { ALL_LANGUAGES, LangKey } from '@/utils/languageData'; 
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import './LogIn.css'

interface LoginProps {
    onClose: () => void;
    currentLang: LangKey;
    onLanguageChange: (lang: LangKey) => void;
}

export default function LogIn({ onClose, currentLang, onLanguageChange }: LoginProps) {
    // 1. Safety check: Ensure language exists, fallback to 1 (English) if undefined
    const safeLang = currentLang || 1;
    const texts = ALL_LANGUAGES[safeLang]?.defaultInfo || {};
    
    const router = useRouter();

    // 2. Removed internal "isLoginModalOpen" state. 
    // If this component is rendered by the parent, it is open.
    const [usernameInput, setUsernameInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                // 3. Call the parent's onClose function
                onClose(); 
                
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

  return (
        <div className="login-overlay">
            <div className="login-box">
                <h3 style={{cursor: 'pointer'}}>Welcome Back</h3> 
                
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
                        <button type="button" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button type="submit" className="confirm-btn" disabled={isSubmitting}>
                            {isSubmitting ? '...' : 'Enter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
  );
}