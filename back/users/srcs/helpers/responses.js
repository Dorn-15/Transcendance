import { serviceName, version } from '../serviceMeta.js';

const	buildOk = (message, payload = {}) => {
	return {
		status: 'ok',
		service: serviceName,
		version: version,
		message,
		...payload
	};
};

const	buildError = (message) => {
	return {
		status: 'error',
		service: serviceName,
		version: version,
		message
	};
};

export { buildOk, buildError };

