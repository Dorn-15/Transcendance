import Fastify from 'fastify';

const	fastify				= Fastify({ logger: true });
const	serviceName			= 'connect-back';

const	buildHealthPayload = () => ({
	status: 'ok',
	service: serviceName
});

const	buildServicePayload = () => ({
	status: 'ok',
	service: serviceName,
	description: 'API for users connections',
	version: '1.0.0'
});

const	registerHealthRoutes = () => {
	fastify.get('/health', async () => {
		return buildHealthPayload();
	});
};

const	registerServiceRoutes = () => {
	const	handler = async (request) => {
		const	body = request?.body ?? null;
		request.log.info({ body }, 'Ping received');
		return buildServicePayload();
	};
	fastify.get('/', handler);
};

const	registerFallbackHandler = () => {
	fastify.setNotFoundHandler(async (request, reply) => {
		request.log.warn({ url: request.url }, 'Fallback handler triggered');
		reply.code(200);
		return buildServicePayload();
	});
};

const	start = async () => {
	fastify.log.info('Starting connect-back server...');
	try {
		await fastify.listen({ port: 4002, host: '0.0.0.0' });
		fastify.log.info('Connect-back server started on port 4002');
	} catch (err) {
		fastify.log.error('Error starting connect-back server:', err);
		fastify.log.error(err);
		process.exit(1);
	}
};

registerHealthRoutes();
registerServiceRoutes();
registerFallbackHandler();
start();
