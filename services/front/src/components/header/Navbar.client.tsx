'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ALL_LANGUAGES, LangKey } from '@/utils/languageData';
import SettingsView from '../views/SettingsView';
import LegalView from '../views/LegalView';
import './Navbar.css';

interface NavbarClientProps {
	userName: string;
}

export default function NavbarClient({ userName }: NavbarClientProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const langParam = searchParams.get('lang');
	const paramValue = Number(langParam);
	const currentLang: LangKey = (langParam && ALL_LANGUAGES[paramValue])
		? (paramValue as LangKey)
		: 1;

	const [currentView, setCurrentView] = useState<'menu' | 'settings' | 'legal'>('menu');
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const changeLanguage = (langId: LangKey) => {
		router.push(`/?lang=${langId}`, { scroll: false });
	};

	const handleLogout = async () => {
		try {
			const res = await fetch('/api/logout', {
				method: 'POST',
				credentials: 'include',
			});

			if (!res.ok) {
				console.error('Logout failed with status', res.status);
				return;
			}

			router.push(`/login/?lang=${currentLang}`);
			router.refresh();
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	const texts = ALL_LANGUAGES[currentLang].defaultInfo;
	const backToMenu = () => setCurrentView('menu');

	const openViewFromMobile = (view: 'settings' | 'legal') => {
		setCurrentView(view);
		setIsMobileMenuOpen(false);
	};

	return (
		<>
			<header>
				<div className="title-overlay">
					<button
						className="mobile-menu-btn"
						onClick={() => setIsMobileMenuOpen(true)}
						aria-label="Open Menu"
					>
						☰
					</button>

					<div className="main-title">{texts.trans}</div>

					<nav className="main-menu desktop-only">
						<button onClick={() => setCurrentView('settings')}>{texts.param}</button>
						<button onClick={() => setCurrentView('legal')}>{texts.legal}</button>
					</nav>
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

			<div className={`mobile-sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>

			<div className={`mobile-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
				<button className="mobile-close-btn" onClick={() => setIsMobileMenuOpen(false)}>✕</button>

				<div className="mobile-user-section">
					<span className="mobile-user-label">{texts.connectedAs}</span>
					<span className="mobile-user-name">{userName}</span>
				</div>

				<nav className="mobile-nav">
					<button onClick={() => openViewFromMobile('settings')}>{texts.param}</button>
					<button onClick={() => openViewFromMobile('legal')}>{texts.legal}</button>
				</nav>

				<button className="mobile-logout-btn" onClick={handleLogout}>
					{texts.signOut}
				</button>
			</div>

			{currentView !== 'menu' && (
				<div className="blur-overlay">
					{currentView === 'settings' && (
						<SettingsView
							onClose={backToMenu}
							currentLang={currentLang}
							onLanguageChange={changeLanguage}
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
