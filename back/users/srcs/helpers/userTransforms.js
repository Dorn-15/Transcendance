const	toPublicUser = (user) => {
	if (!user)
		return null;
	const	{ passwordHash, ...safeUser } = user;
	return safeUser;
};

export { toPublicUser };

