import styles from './page.module.css';
import LoginForm from './loginForm';
import LoggedInCard from './loggedInCard';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

type AuthStatus =
	| { authenticated: false }
	| { authenticated: true; username: string };

//const AUTH_URL = 'http://localhost:4001';
const AUTH_URL = 'http://transcendance-social_service:4001';

async function getAuthStatus(): Promise<AuthStatus> {
	const cookieStore = cookies();

	const res = await fetch(`${AUTH_URL}/auth/status`, {
		headers: {
			Cookie: cookieStore.toString(),
		},
		cache: 'no-store',
	});

	if (!res.ok) return { authenticated: false };
	return res.json();
}

export default async function Page() {
	const authStatus = await getAuthStatus();

	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<div className={styles.header}>
					<div className={styles.title}>Auth test</div>
					<div className={styles.tagline}>
						Simple auth service test frontend
					</div>
				</div>

				{!authStatus.authenticated ? (
					<LoginForm />
				) : (
					<LoggedInCard username={authStatus.username} />
				)}
			</main>
		</div>
	);
}
