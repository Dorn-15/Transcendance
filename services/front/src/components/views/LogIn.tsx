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
	const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

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
			if (mode === 'register' && passwordInput !== confirmPasswordInput) {
				setErrorMessage(texts.confirmPasswordError);
				return;
			}
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
				if (data?.message === 'Email already exists')
					setErrorMessage(texts.emailAlreadyExists);
				else if (data?.message === 'User already exists')
					setErrorMessage(texts.userAlreadyExists);
				else if (data?.message === 'Missing fields')
					setErrorMessage(texts.missingFields);
				else
					setErrorMessage(data?.message || texts.operationFailed);
				return;
			}
		} catch (error) {
			setErrorMessage('Unexpected error, please retry.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="login-overlay">
			<div className="login-box">
				<h3>{mode === 'login' ? texts.welcome : texts.newAccount}</h3>
				{errorMessage && <p className="login-error">{errorMessage}</p>}

				<form onSubmit={handleSubmit}>
					<input
						type="text"
						placeholder={mode === 'login' ? texts.loginOrEmail : texts.username}
						value={loginInput}
						onChange={(e) => setLoginInput(e.target.value)}
						disabled={isSubmitting}
						autoFocus
						maxLength={32}
					/>
					{mode === 'register' && (
						<input
							type="email"
							placeholder={texts.email}
							value={emailInput}
							onChange={(e) => setEmailInput(e.target.value)}
							disabled={isSubmitting}
							maxLength={64}
						/>
					)}
					<input
						type="password"
						placeholder={texts.passWord}
						value={passwordInput}
						onChange={(e) => setPasswordInput(e.target.value)}
						disabled={isSubmitting}
						maxLength={64}
					/>
					{mode === 'register' && (
						<input
						type="password"
						placeholder={texts.confirmPassword}
						value={confirmPasswordInput}
						onChange={(e) => setConfirmPasswordInput(e.target.value)}
						disabled={isSubmitting}
						maxLength={64}
						/>
					)}
					<div className="login-actions">
						<button type="submit" className="confirm-btn" disabled={isSubmitting}>
							{isSubmitting ? '...' : mode === 'login' ? texts.enter : texts.create}
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
							{mode === 'login' ? texts.newAccount : texts.back}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
