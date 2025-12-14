'use client';

import { useState } from 'react';

export default function LoginForm() {
	const [username, setUsername] = useState('');
	const [loading, setLoading] = useState(false);

	async function submit() {
		if (!username.trim()) return;

		setLoading(true);

		await fetch('http://localhost:4001/auth/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({ username }),
		});

		setLoading(false);
		window.location.reload();
	}

	function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'Enter') {
			submit();
		}
	}

	return (
		<div>
			<div>
				<input
					type="text"
					placeholder="Username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					onKeyDown={onKeyDown}
				/>
			</div>

			<button onClick={submit} disabled={loading}>
				{loading ? 'Connecting…' : 'Connect'}
			</button>
		</div>
	);
}
