import db from '../db/sqliteClient.js';

const	mapRow = (row) => {
	if (!row)
		return null;
	return {
		id: row.id,
		email: row.email,
		passwordHash: row.password_hash,
		displayName: row.display_name,
		avatarUrl: row.avatar_url,
		isGuest: Boolean(row.is_guest),
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
};

const	createUserRecord = ({ email, passwordHash, displayName, avatarUrl = '', isGuest = 0 }) => {
	const	currentTimestamp = Date.now();
	const	insertStatement = db.prepare(`
		INSERT INTO users (
			email,
			password_hash,
			display_name,
			avatar_url,
			is_guest,
			created_at,
			updated_at
		) VALUES (
			@email,
			@passwordHash,
			@displayName,
			@avatarUrl,
			@isGuest,
			@createdAt,
			@updatedAt
		);
	`);
	const	runResult = insertStatement.run({
		email,
		passwordHash,
		displayName,
		avatarUrl,
		isGuest,
		createdAt: currentTimestamp,
		updatedAt: currentTimestamp
	});
	return getUserById(runResult.lastInsertRowid);
};

const	createGuestUser = ({ email, displayName, avatarUrl = '' }) => {
	return createUserRecord({
		email,
		passwordHash: '',
		displayName,
		avatarUrl,
		isGuest: 1
	});
};

const	getUserByEmail = (email) => {
	const	query = db.prepare('SELECT * FROM users WHERE email = ? LIMIT 1;');
	return mapRow(query.get(email));
};

const	getUserById = (id) => {
	const	query = db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1;');
	return mapRow(query.get(id));
};

const	updateColumn = (id, columnName, value) => {
	const	updateStatement = db.prepare(`
		UPDATE users
		SET ${columnName} = @value,
			updated_at = @updatedAt
		WHERE id = @id;
	`);
	updateStatement.run({
		value,
		id,
		updatedAt: Date.now()
	});
	return getUserById(id);
};

const	updateDisplayName = (id, displayName) => {
	return updateColumn(id, 'display_name', displayName);
};

const	updateEmailAddress = (id, email) => {
	return updateColumn(id, 'email', email);
};

const	updatePasswordHash = (id, passwordHash) => {
	return updateColumn(id, 'password_hash', passwordHash);
};

const	updateAvatarUrl = (id, avatarUrl) => {
	return updateColumn(id, 'avatar_url', avatarUrl);
};

const	deleteUserById = (id) => {
	const	query
		= db.prepare('DELETE FROM users WHERE id = ?;');
	query.run(id);
};

export {
	createGuestUser,
	createUserRecord,
	deleteUserById,
	getUserByEmail,
	getUserById,
	updateAvatarUrl,
	updateDisplayName,
	updateEmailAddress,
	updatePasswordHash
};

