import {
	BadRequestException,
	ConflictException,
	Body,
	Controller,
	Get,
	Post,
	Req,
	Res,
	UnauthorizedException,
} from '@nestjs/common';
import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import { UserService } from './user.service';
import { SessionService } from './session.service';

type RegisterBody = {
	login?: string;
	email?: string;
	password?: string;
};

type LoginBody = {
	identifier?: string;
	password?: string;
};

@Controller('auth')
export class AuthController {
	constructor(
		private readonly userService: UserService,
		private readonly sessionService: SessionService,
	) {}

	@Get('status')
	async status(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	) {
		const cookie = request.cookies?.Authentication;
		if (!cookie) {
			return { authenticated: false };
		}

		const login = await this.sessionService.getLoginByCookie(cookie);
		if (!login) {
			response.clearCookie('Authentication', { path: '/' });
			return { authenticated: false };
		}

		const user = await this.userService.findByLogin(login);
		if (!user || user.last_cookie !== cookie) {
			await this.sessionService.deleteSession(cookie);
			response.clearCookie('Authentication', { path: '/' });
			return { authenticated: false };
		}

		// Touch last connection for observability
		await this.userService.updateConnection(login, cookie);

		return {
			authenticated: true,
			username: login,
		};
	}

	@Post('register')
	async register(@Body() body: RegisterBody) {
		const login = body.login?.trim();
		const email = body.email?.trim().toLowerCase();
		const password = body.password?.trim();

		if (!login || !email || !password) {
			throw new BadRequestException('Missing fields');
		}

		if (await this.userService.findByLogin(login)) {
			throw new ConflictException('User already exists');
		}
		else if (await this.userService.findByEmail(email)) {
			throw new ConflictException('Email already exists');
		}

		const user = await this.userService.createUser(login, email, password);

		return { success: true, login: user.login, email: user.email };
	}

	@Post('login')
	async login(
		@Body() body: LoginBody,
		@Res({ passthrough: true }) response: Response,
	) {
		const identifier = body.identifier?.trim();
		const password = body.password?.trim();

		if (!identifier || !password) {
			throw new BadRequestException('Missing credentials');
		}

		const user = await this.userService.findByLoginOrEmail(identifier);
		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const ok = await this.userService.verifyPassword(user, password);
		if (!ok) {
			throw new UnauthorizedException('Invalid credentials');
		}

		if (user.last_cookie) {
			await this.sessionService.deleteSession(user.last_cookie);
		}

		const sessionToken = crypto.randomUUID();
		await this.sessionService.setSession(sessionToken, user.login);
		await this.userService.updateConnection(user.login, sessionToken);

		const secure = process.env.NODE_ENV === 'production';
		response.cookie('Authentication', sessionToken, {
			httpOnly: true,
			secure,
			sameSite: 'lax',
			path: '/',
			maxAge: 1000 * 60 * 60 * 24 * 7,
		});

		return {
			authenticated: true,
			username: user.login,
		};
	}

	@Post('logout')
	async logout(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	) {
		const cookie = request.cookies?.Authentication;

		if (cookie) {
			const login = await this.sessionService.getLoginByCookie(cookie);
			if (login) {
				await this.userService.updateConnection(login, null);
			}
			await this.sessionService.deleteSession(cookie);
		}

		response.clearCookie('Authentication', { path: '/' });

		return {
			authenticated: false,
		};
	}
}
