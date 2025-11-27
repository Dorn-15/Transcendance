import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/api/service1/health', async () => {
	return { status: 'ok', service: 'service1' };
});

const start = async () => {
	try {
		await fastify.listen({ port: 4001, host: '0.0.0.0' });
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
