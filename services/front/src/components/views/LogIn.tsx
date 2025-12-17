'use client'; // 1. Indispensable pour les hooks (useState, useRouter)

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import './LogIn.css';

export default function LogIn() {
    const router = useRouter();

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
                
                router.refresh(); 


                router.push('/'); 
            } else {
                alert("Login failed");
                setIsSubmitting(false);
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
                        <button type="submit" className="confirm-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Loading...' : 'Enter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}