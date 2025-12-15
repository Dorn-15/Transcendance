import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	getHealth(): object {
		return { status: 200, message: 'OK' };
	}

	getHello(gateway: string): string {
		return `Welcome to ${gateway}!`;
	}
}
