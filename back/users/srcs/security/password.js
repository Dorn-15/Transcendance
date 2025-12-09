import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const	hashPassword = (password) => {
	const	salt = randomBytes(16).toString('hex');
	const	derivedKey = scryptSync(password, salt, 64).toString('hex');
	return `${salt}:${derivedKey}`;
};

const	verifyPassword = (password, storedHash) => {
	if (!storedHash)
		return false;
	const	parts = storedHash.split(':');
	if (parts.length !== 2)
		return false;
	const	salt = parts[0];
	const	hash = parts[1];
	const	computed = scryptSync(password, salt, 64);
	const	storedBuffer = Buffer.from(hash, 'hex');
	return timingSafeEqual(storedBuffer, computed);
};

export { hashPassword, verifyPassword };

