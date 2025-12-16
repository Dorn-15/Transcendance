import { Controller, Get, Post, Body, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
	private readonly connectedUsers: Set<string> = new Set();

	@Get('status')
	status(@Req() request: Request) {
		const username = request.cookies?.Authentication;

		if (username && this.connectedUsers.has(username)) {
			return {
				authenticated: true,
				username,
			};
		}

		return {
			authenticated: false,
		};
	}

	@Post('login')
	login(
		@Body() body: { username: string },
		@Res({ passthrough: true }) response: Response,
	) {
		const username = body.username?.trim();

		if (!username) {
			return { authenticated: false };
		}

		this.connectedUsers.add(username);

		response.cookie('Authentication', username, {
			httpOnly: true,
			secure: false, // true when HTTPS
			sameSite: 'lax',
			path: '/',
		});

		return {
			authenticated: true,
			username,
		};
	}

	@Post('logout')
	logout(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	) {
		const username = request.cookies?.Authentication;

		if (username) {
			this.connectedUsers.delete(username);
		}

		response.clearCookie('Authentication', { path: '/' });

		return {
			authenticated: false,
		};
	}
}