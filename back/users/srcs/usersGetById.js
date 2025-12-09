import { getUserById as getUserRecord } from './repositories/userRepository.js';
import { buildOk, buildError } from './helpers/responses.js';
import { toPublicUser } from './helpers/userTransforms.js';

const	resolveUserId = (request) => {
	const	rawId = request?.params?.userId;
	const	userId = Number.parseInt(rawId, 10);
	return Number.isNaN(userId) ? null : userId;
};

const	getUserById = () => {
	return async (request, reply) => {
		const	userId = resolveUserId(request);
		if (userId === null) {
			reply.code(400);
			return buildError('Invalid user id');
		}
		const	user = getUserRecord(userId);
		if (!user) {
			reply.code(404);
			return buildError('User not found');
		}
		return buildOk('User retrieved', { user: toPublicUser(user) });
	};
};

const	getProfileById = () => {
	return async (request, reply) => {
		const	userId = resolveUserId(request);
		if (userId === null) {
			reply.code(400);
			return buildError('Invalid user id');
		}
		const	user = getUserRecord(userId);
		if (!user) {
			reply.code(404);
			return buildError('User not found');
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

const	getAvatarById = () => {
	return async (request, reply) => {
		const	userId = resolveUserId(request);
		if (userId === null) {
			reply.code(400);
			return buildError('Invalid user id');
		}
		const	user = getUserRecord(userId);
		if (!user) {
			reply.code(404);
			return buildError('User not found');
		}
		return buildOk('Avatar retrieved', { avatarUrl: user.avatarUrl });
	};
};

const	getNameById = () => {
	return async (request, reply) => {
		const	userId = resolveUserId(request);
		if (userId === null) {
			reply.code(400);
			return buildError('Invalid user id');
		}
		const	user = getUserRecord(userId);
		if (!user) {
			reply.code(404);
			return buildError('User not found');
		}
		return buildOk('Display name retrieved', { displayName: user.displayName });
	};
};

export { getUserById, getProfileById, getAvatarById, getNameById };
