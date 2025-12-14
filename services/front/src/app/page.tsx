import PongClient from './PongClient';
import LoginForm from './loginForm';
import styles from './page.module.css';

// Forcer un rendu dynamique pour lire l'environnement au runtime (Docker)
export const dynamic = 'force-dynamic';


type AuthStatus = {
	authenticated: boolean;
};

export type GatewayConfig = {
	origin: string;
	path: string;
	basePath: string;
};

function	getGatewayConfig(env: NodeJS.ProcessEnv): GatewayConfig {
	const	rawDomain = env.DOMAIN ?? '';
	const	wsBasePath = env.WS_PATH ?? '/ws';

	if (rawDomain !== '') {
		const	trimmedDomain = rawDomain.replace(/\/+$/, '').replace(/\/ws$/, '');

		const	origin = trimmedDomain.startsWith('http://') || trimmedDomain.startsWith('https://')
			? trimmedDomain
			: `https://${trimmedDomain}`;

		const	basePath = wsBasePath.replace(/\/+$/, '');

		return {
			origin,
			path: `${basePath}/socket.io`,
			basePath: `${basePath}`,
		};
	}

	return {
		origin: 'http://localhost:4006',
		path: '/socket.io',
		basePath: '',
	};
}

async function getAuthStatus( gatewayConfig: GatewayConfig): Promise<AuthStatus> {
	try {
		const res = await fetch(
			`${gatewayConfig.basePath}/api/auth/status`,
			{
				credentials: 'include',
				cache: 'no-store',
			}
		);

		if (!res.ok) {
			return { authenticated: false };
		}

		return (await res.json()) as AuthStatus;
	} catch {
		return { authenticated: false };
	}
}



export default async function Page() {
	const env = process.env as NodeJS.ProcessEnv;
	const gatewayConfig = getGatewayConfig(env);
	const authStatus = await getAuthStatus(gatewayConfig);

	if (!authStatus.authenticated) {
		return (
			<div className={styles.page}>
				<main className={styles.main}>
					<div className={styles.header}>
						<div className={styles.title}>Gateway + Games (Pong)</div>
					</div>

					<LoginForm />
				</main>
			</div>
		);
	}

	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<div className={styles.header}>
					<div className={styles.title}>Gateway + Games (Pong)</div>
					<div className={styles.tagline}>
						Contrôle du jeu via WebSocket (flèches ↑ / ↓).
					</div>
				</div>

				<PongClient gatewayConfig={gatewayConfig} />
			</main>
		</div>
	);
}
