'use client';

import { useState } from 'react';
import styles from './page.module.css';

//const AUTH_URL = 'http://localhost:4001';
const AUTH_URL = 'http://transcendance-social_service:4001';

export default function LoginForm() {
	const [username, setUsername] = useState('');
	const [error, setError] = useState('');

	async function submit() {
		if (!username.trim()) {
			setError('Username required');
			return;
		}

		const res = await fetch(`${AUTH_URL}/auth/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({ username }),
		});

		if (!res.ok) {
			setError('Login failed');
			return;
		}

		window.location.reload();
	}

	return (
		<div className={styles.card}>
			<div className={styles.cardHeader}>
				<div className={styles.label}>Log in / Create user</div>
			</div>

			<div className={styles.inputs}>
				<div className={styles.inputGroup}>
					<label className={styles.fieldLabel}>Username</label>
					<input
						className={styles.input}
						placeholder="alice"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && submit()}
					/>
				</div>

				<button className={styles.button} onClick={submit}>
					Connect
				</button>

				{error && <div className={styles.error}>{error}</div>}
			</div>
		</div>
	);
}
