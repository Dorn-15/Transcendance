import { randomUUID } from 'node:crypto';
import Redis from 'ioredis';
import config from './config.js';

const	redisClient = new Redis(config.redisUrl);

redisClient.on('error', (error) => {
	console.error('[users-back][redis]', error);
});

const	sessionKey = (sessionId) => {
	return `session:${sessionId}`;
};

const	createSession = async (userId) => {
	const	sessionId = randomUUID();
	await redisClient.set(
		sessionKey(sessionId),
		JSON.stringify({ userId }),
		'EX',
		config.sessionTtlSeconds
	);
	return sessionId;
};

const	resolveSession = async (sessionId) => {
	if (!sessionId)
		return null;
	const	rawSession = await redisClient.get(sessionKey(sessionId));
	if (!rawSession)
		return null;
	try {
		return JSON.parse(rawSession);
	} catch (error) {
		console.error('[users-back][session][parse]', error);
		return null;
	}
};

const	destroySession = async (sessionId) => {
	if (!sessionId)
		return;
	await redisClient.del(sessionKey(sessionId));
};

export { createSession, destroySession, resolveSession, redisClient };
