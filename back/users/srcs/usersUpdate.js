import { buildOk, buildError } from './helpers/responses.js';
import { loadUserFromSession } from './helpers/currentUser.js';
import { updateAvatarUrl, updateDisplayName, updateEmailAddress, updatePasswordHash, getUserByEmail } from './repositories/userRepository.js';
import { hashPassword, verifyPassword } from './security/password.js';
import { toPublicUser } from './helpers/userTransforms.js';

const	requireSessionUser = async (request, reply) => {
	const	user = await loadUserFromSession(request);
	if (!user) {
		reply.code(401);
		return null;
	}
	return user;
};

const	updateName = () => {
	return async (request, reply) => {
		const	user = await requireSessionUser(request, reply);
		if (!user)
			return buildError('Session required');

		const	newName = typeof request.body?.displayName === 'string' ? request.body.displayName.trim() : '';
		if (!newName)
			return buildError('displayName is required');

		const	updatedUser = updateDisplayName(user.id, newName);
		return buildOk('Display name updated', { user: toPublicUser(updatedUser) });
	};
};

const	updateEmail = () => {
	return async (request, reply) => {
		const	user = await requireSessionUser(request, reply);
		if (!user)
			return buildError('Session required');

		const	newEmail = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
		if (!newEmail)
			return buildError('email is required');
		if (newEmail === user.email)
			return buildOk('Email unchanged', { user: toPublicUser(user) });
		if (getUserByEmail(newEmail)) {
			reply.code(409);
			return buildError('Email already in use');
		}

		const	updatedUser = updateEmailAddress(user.id, newEmail);
		return buildOk('Email updated', { user: toPublicUser(updatedUser) });
	};
};

const	updatePassword = () => {
	return async (request, reply) => {
		const	user = await requireSessionUser(request, reply);
		if (!user)
			return buildError('Session required');

		const	currentPassword = typeof request.body?.currentPassword === 'string' ? request.body.currentPassword : '';
		const	newPassword = typeof request.body?.newPassword === 'string' ? request.body.newPassword : '';
		if (!currentPassword || !newPassword) {
			reply.code(400);
			return buildError('currentPassword and newPassword are required');
		}
		if (!verifyPassword(currentPassword, user.passwordHash ?? '')) {
			reply.code(401);
			return buildError('Current password incorrect');
		}

		const	newHash = hashPassword(newPassword);
		const	updatedUser = updatePasswordHash(user.id, newHash);
		return buildOk('Password updated', { user: toPublicUser(updatedUser) });
	};
};

const	updateAvatar = () => {
	return async (request, reply) => {
		const	user = await requireSessionUser(request, reply);
		if (!user)
			return buildError('Session required');

		const	newAvatar = typeof request.body?.avatarUrl === 'string' ? request.body.avatarUrl.trim() : '';
		if (!newAvatar) {
			reply.code(400);
			return buildError('avatarUrl is required');
		}

		const	updatedUser = updateAvatarUrl(user.id, newAvatar);
		return buildOk('Avatar updated', { user: toPublicUser(updatedUser) });
	};
};

export { updateName, updateEmail, updatePassword, updateAvatar };
