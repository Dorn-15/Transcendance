import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	getHealth(): object {
		return { status: 200, message: 'OK' };
	}

	getHello(game: string): string {
		return `Welcome to ${game}!`;
	}
}
