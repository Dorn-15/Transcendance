import config from './config.js';

const	cookieOptions = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax',
	secure: config.nodeEnv === 'production',
	maxAge: config.sessionTtlSeconds
};

export default cookieOptions;

