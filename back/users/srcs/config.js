import path from 'node:path';

const	defaultSqlitePath = process.env.SQLITE_DB_PATH ?? path.resolve(process.cwd(), 'data/users.sqlite');
const	sessionTtlSecondsEnv = Number.parseInt(process.env.SESSION_TTL_SECONDS ?? '86400', 10);
const	sessionTtlSeconds = Number.isNaN(sessionTtlSecondsEnv) ? 86400 : sessionTtlSecondsEnv;

const	config = {
	sqliteFile: defaultSqlitePath,
	redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379/0',
	sessionTtlSeconds,
	nodeEnv: process.env.NODE_ENV ?? 'development',
	cookieName: process.env.SESSION_COOKIE_NAME ?? 'transcendance_session',
	cookieSecret: process.env.COOKIE_SECRET ?? 'development-secret-change-me'
};

export default config;

