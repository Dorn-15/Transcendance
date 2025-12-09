import { loadUserFromSession } from './helpers/currentUser.js';
import { buildOk, buildError } from './helpers/responses.js';
import { toPublicUser } from './helpers/userTransforms.js';

const	requireSessionUser = async (request, reply) => {
	const	user = await loadUserFromSession(request);
	if (!user) {
		reply.code(401);
		return null;
	}
	return user;
};

const	getUser = () => {
	return async (request, reply) => {
		const	user = await requireSessionUser(request, reply);
		if (!user) {
			return buildError('Session required');
		}
		return buildOk('User retrieved', { user: toPublicUser(user) });
	};
};

const	getProfile = () => {
	return async (request, reply) => {
		const	user = await requireSessionUser(request, reply);
		if (!user) {
			return buildError('Session required');
		}
		return buildOk('Profile retrieved', {
			profile: {
				id: user.id,
				displayName: user.displayName,
				avatarUrl: user.avatarUrl,
				isGuest: user.isGuest,
				createdAt: user.createdAt
			}
		});
	};
};

const	getAvatar = () => {
	return async (request, reply) => {
		const	user = await requireSessionUser(request, reply);
		if (!user) {
			return buildError('Session required');
		}
		return buildOk('Avatar retrieved', { avatarUrl: user.avatarUrl });
	};
};

const	getName = () => {
	return async (request, reply) => {
		const	user = await requireSessionUser(request, reply);
		if (!user) {
			return buildError('Session required');
		}
		return buildOk('Display name retrieved', { displayName: user.displayName });
	};
};

export { getUser, getProfile, getAvatar, getName };
