import { serviceName, version } from './serviceMeta.js';

const	homeRoute = () => {
	return async (request, reply) => {
		return {
			status: 'ok',
			service: serviceName,
			version: version,
			description: 'API for users management'
		};
	};
};

const	healthRoute = () => {
	return async (request, reply) => {
		return {
			status: 'ok',
			service: serviceName,
			version: version
		};
	};
};

const notFoundRoute = () => {
	return async (request, reply) => {
		return {
			status: 'error',
			service: serviceName,
			version: version,
			message: 'Not found'
		};
	};
};

export { homeRoute, healthRoute, notFoundRoute };
