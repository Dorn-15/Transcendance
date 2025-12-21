import 'server-only';

export type GatewayConfig = {
	url: string;
	path: string;
};

function computeGatewayConfig(): GatewayConfig {
	const env =
		process.env.NODE_ENV as string | undefined;

	if (env === 'development' || env === null || env === undefined) {
		return {
			url: 'http://localhost:4006',
			path: '/socket.io',
		};
	}

	if (process.env.DOMAIN && process.env.DOMAIN.length > 0) {
		return {
			url: `https://${process.env.DOMAIN}`,
			path: '/ws/socket.io',
		};
	}

	return {
		url: '',
		path: '/ws/socket.io',
	};
}

const gatewayConfig: GatewayConfig = computeGatewayConfig();

export function getGatewayConfig(): GatewayConfig {
	return gatewayConfig;
}


