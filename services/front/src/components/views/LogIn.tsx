'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { preloadAsset } from '@/utils/assetLoader';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';
import './LogIn.css';

type Mode = 'login' | 'register';

export default function LogIn() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// 1. Calcul de la langue sécurisé
	const currentLang = useMemo<LangKey>(() => {
		const langParam = searchParams.get('lang');
		const paramValue = Number(langParam);
		return (langParam && ALL_LANGUAGES[paramValue])
			? (paramValue as LangKey)
			: 1;
	}, [searchParams]);

	const texts = ALL_LANGUAGES[currentLang].defaultInfo;

	const [mode, setMode] = useState<Mode>('login');
	const [loginInput, setLoginInput] = useState('');
	const [emailInput, setEmailInput] = useState('');
	const [passwordInput, setPasswordInput] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	// Préchargement des assets 3D pour qu'ils soient prêts après le login
	useEffect(() => {
		const assets = [
			'Breakout.glb',
			'Pong.glb',
			'SpaceInvaders.glb',
			'room.glb',
			'table.glb'
		];
		assets.forEach((file) => preloadAsset(file));
	}, []);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		setErrorMessage('');

		if (mode === 'login') {
			if (!loginInput.trim() || !passwordInput.trim()) {
				return;
			}
		} else {
			if (!loginInput.trim() || !emailInput.trim() || !passwordInput.trim()) {
				return;
			}
		}

		setIsSubmitting(true);

		try {
			const endpoint = mode === 'login' ? '/api/login' : '/api/register';
			const payload =
				mode === 'login'
					? { identifier: loginInput.trim(), password: passwordInput.trim() }
					: { login: loginInput.trim(), email: emailInput.trim(), password: passwordInput.trim() };

			const res = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (res.ok) {
				setErrorMessage('');
				setPasswordInput('');
				if (mode === 'register') {
					setMode('login');
					setEmailInput('');
				} else {
					setLoginInput('');
					router.refresh();
					router.push(`/?lang=${currentLang}`);
				}
			} else {
				const data = await res.json().catch(() => ({}));
				setErrorMessage(data?.message || 'Operation failed');
			}
		} catch (error) {
			console.error(error);
			setErrorMessage('Unexpected error, please retry.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="login-overlay">
			<div className="login-box">
				<h3>{mode === 'login' ? texts.welcome : 'Create account'}</h3>
				{errorMessage && <p className="login-error">{errorMessage}</p>}

				<form onSubmit={handleSubmit}>
					<input
						type="text"
						placeholder={mode === 'login' ? 'Login or email' : 'Login'}
						value={loginInput}
						onChange={(e) => setLoginInput(e.target.value)}
						disabled={isSubmitting}
						autoFocus
						maxLength={32}
					/>
					{mode === 'register' && (
						<input
							type="email"
							placeholder="Email"
							value={emailInput}
							onChange={(e) => setEmailInput(e.target.value)}
							disabled={isSubmitting}
							maxLength={64}
						/>
					)}
					<input
						type="password"
						placeholder="Password"
						value={passwordInput}
						onChange={(e) => setPasswordInput(e.target.value)}
						disabled={isSubmitting}
						maxLength={64}
					/>
					<div className="login-actions">
						<button type="submit" className="confirm-btn" disabled={isSubmitting}>
							{isSubmitting ? '...' : mode === 'login' ? texts.enter : 'Register'}
						</button>
						<button
							type="button"
							className="confirm-btn"
							disabled={isSubmitting}
							onClick={() => {
								setMode(mode === 'login' ? 'register' : 'login');
								setErrorMessage('');
							}}
						>
							{mode === 'login' ? 'Need an account?' : 'Back to login'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
