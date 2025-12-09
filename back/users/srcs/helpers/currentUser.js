import config from '../config.js';
import { resolveSession } from '../sessionStore.js';
import { getUserById } from '../repositories/userRepository.js';

const	loadUserFromSession = async (request) => {
	const	sessionId = request?.cookies?.[config.cookieName];
	if (!sessionId)
		return null;
	const	session = await resolveSession(sessionId);
	if (!session?.userId)
		return null;
	return getUserById(session.userId);
};

export { loadUserFromSession };

