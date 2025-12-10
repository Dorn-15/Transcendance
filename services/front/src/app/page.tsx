import PongClient from './PongClient';
import styles from './page.module.css';

// Forcer un rendu dynamique pour lire l'environnement au runtime (Docker)
export const dynamic = 'force-dynamic';

export type GatewayConfig = {
	origin: string;
	path: string;
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
		};
	}

	return {
		origin: 'http://localhost:4006',
		path: '/socket.io',
	};
}

export default function Page() {
	const	env = process.env as NodeJS.ProcessEnv;
	const	gatewayConfig = getGatewayConfig(env);

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

