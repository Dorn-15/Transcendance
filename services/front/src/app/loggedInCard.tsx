'use client';

import styles from './page.module.css';

//const AUTH_URL = 'http://localhost:4001';
const AUTH_URL = 'http://transcendance-social_service:4001';

export default function LoggedInCard({ username }: { username: string }) {
	async function logout() {
		await fetch(`${AUTH_URL}/auth/logout`, {
			method: 'POST',
			credentials: 'include',
		});

		window.location.reload();
	}

	return (
		<div className={styles.card}>
			<div className={styles.cardHeader}>
				<div className={styles.label}>Session</div>
				<div className={styles.status}>Connected</div>
			</div>

			<div>
				Logged in as <strong>{username}</strong>
			</div>

			<button className={`${styles.button} ${styles.danger}`} onClick={logout}>
				Log out
			</button>
		</div>
	);
}
