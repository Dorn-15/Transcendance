import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import { homeRoute, healthRoute, notFoundRoute } from './srcs/serverRoutes.js';
import { loginUser, logoutUser, createUser, createGuest, deleteUser } from './srcs/usersManage.js';
import { updateName, updateEmail, updatePassword, updateAvatar } from './srcs/usersUpdate.js';
import { getUser, getProfile, getAvatar, getName } from './srcs/usersGet.js';
import { getUserById, getProfileById, getAvatarById, getNameById } from './srcs/usersGetById.js';
import cookieOptions from './srcs/cookieOptions.js';
import config from './srcs/config.js';

const	fastify = Fastify({ logger: true });

const usersRoutes = () => {
	// Manage users
	fastify.post('/login',			loginUser());
	fastify.post('/logout',			logoutUser());
	fastify.post('/register',		createUser());
	fastify.post('/guest',			createGuest());
	fastify.post('/delete',			deleteUser());

	// Update user
	fastify.post('/update/name',	updateName());
	fastify.post('/update/email',	updateEmail());
	fastify.post('/update/password',updatePassword());
	fastify.post('/update/avatar',	updateAvatar());

	// Get user with token
	fastify.get('/user',			getUser());
	fastify.get('/user/profile',	getProfile());
	fastify.get('/user/avatar',		getAvatar());
	fastify.get('/user/name',		getName());

	// Get user by id
	fastify.get('/user/:userId',		getUserById());
	fastify.get('/user/profile/:userId',getProfileById());
	fastify.get('/user/avatar/:userId',	getAvatarById());
	fastify.get('/user/name/:userId',	getNameById());
};

const serverRoutes = () => {
	fastify.get('/', homeRoute());
	fastify.get('/health', healthRoute());
	fastify.setNotFoundHandler(notFoundRoute());
};

const	registerPlugins = async () => {
	await fastify.register(cookie, {
		secret: config.cookieSecret,
		parseOptions: cookieOptions
	});
};

const	portEnv = Number.parseInt(process.env.PORT, 10);
if (Number.isNaN(portEnv)) {
	throw new Error('PORT environment variable is not set');
}

const	run = async () => {
	fastify.log.info('Starting users-back server...');
	try {
		await registerPlugins();
		usersRoutes();
		serverRoutes();
		await fastify.listen({ port: portEnv, host: '0.0.0.0' });
		fastify.log.info(`users-back server started on port ${portEnv}`);
	} catch (err) {
		fastify.log.error({ err }, 'Error starting users-back server');
		process.exit(1);
	}
};

run();
