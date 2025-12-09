import crypto from 'node:crypto';
import config from './config.js';
import cookieOptions from './cookieOptions.js';
import { createGuestUser, createUserRecord, deleteUserById, getUserByEmail } from './repositories/userRepository.js';
import { hashPassword, verifyPassword } from './security/password.js';
import { createSession, destroySession } from './sessionStore.js';
import { loadUserFromSession } from './helpers/currentUser.js';
import { buildOk, buildError } from './helpers/responses.js';
import { toPublicUser } from './helpers/userTransforms.js';

const	setSessionCookie = (reply, sessionId) => {
	reply.setCookie(config.cookieName, sessionId, cookieOptions);
};

const	clearSessionCookie = (reply) => {
	reply.clearCookie(config.cookieName, cookieOptions);
};

const	loginUser = () => {
	return async (request, reply) => {
		const	body = request.body ?? {};
		const	email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
		const	password = typeof body.password === 'string' ? body.password : '';
		if (!email || !password)
			return buildError('Email and password are required');
		const	user= getUserByEmail(email);
		if (!user || !verifyPassword(password, user.passwordHash ?? '')) {
			reply.code(401);
			return buildError('Invalid credentials');
		}
		const	sessionId = await createSession(user.id);
		setSessionCookie(reply, sessionId);
		return buildOk('User logged in', { user: toPublicUser(user) });
	};
};

const	logoutUser = () => {
	return async (request, reply) => {
		const	sessionId = request?.cookies?.[config.cookieName];
		await destroySession(sessionId);
		clearSessionCookie(reply);
		return buildOk('User logged out');
	};
};

const	createUser = () => {
	return async (request, reply) => {
		const	body = request.body ?? {};
		const	email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
		const	password = typeof body.password === 'string' ? body.password : '';
		const	displayName = typeof body.displayName === 'string' ? body.displayName.trim() : '';
		const	avatarUrl = typeof body.avatarUrl === 'string' ? body.avatarUrl.trim() : '';
		if (!email || !password || !displayName) {
			reply.code(400);
			return buildError('Email, password and displayName are required');
		}
		if (getUserByEmail(email)) {
			reply.code(409);
			return buildError('Email is already used');
		}
		const	passwordHash = hashPassword(password);
		const	user = createUserRecord({ email, passwordHash, displayName, avatarUrl, isGuest: 0 });
		const	sessionId = await createSession(user.id);
		setSessionCookie(reply, sessionId);
		return buildOk('User created', { user: toPublicUser(user) });
	};
};

const	createGuest = () => {
	return async (_request, reply) => {
		const	randomSuffix = crypto.randomUUID().split('-')[0];
		const	email = `guest-${randomSuffix}@guest.local`;
		const	displayName = `Guest ${randomSuffix}`;
		const	user = createGuestUser({ email, displayName });
		const	sessionId = await createSession(user.id);
		setSessionCookie(reply, sessionId);
		return buildOk('Guest user created', { user: toPublicUser(user) });
	};
};

const	deleteUser = () => {
	return async (request, reply) => {
		const	user = await loadUserFromSession(request);
		if (!user) {
			reply.code(401);
			return buildError('Session required');
		}
		const	sessionId = request?.cookies?.[config.cookieName];
		await destroySession(sessionId);
		deleteUserById(user.id);
		clearSessionCookie(reply);
		return buildOk('User deleted');
	};
};

export { loginUser, logoutUser, createUser, createGuest, deleteUser };
