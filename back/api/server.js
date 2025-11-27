import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/api/service2/health', async () => {
	return { status: 'ok', service: 'service2' };
});

const start = async () => {
	try {
		await fastify.listen({ port: 4002, host: '0.0.0.0' });
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
