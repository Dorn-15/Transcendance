import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class SessionService implements OnModuleInit {
	private client: RedisClientType | null = null;

	async onModuleInit() {
		const url = process.env.REDIS_URL;
		if (!url) {
			throw new Error('REDIS_URL is required for SessionService');
		}
		this.client = createClient({ url });
		this.client.on('error', (err) => {
			console.error('Redis error', err);
		});
		await this.client.connect();
	}

	async setSession(cookie: string, login: string, ttlSeconds = 60 * 60 * 24 * 7) {
		if (!this.client) {
			throw new Error('Redis not initialized');
		}
		await this.client.set(cookie, login, { EX: ttlSeconds });
	}

	async getLoginByCookie(cookie: string): Promise<string | null> {
		if (!this.client) {
			throw new Error('Redis not initialized');
		}
		return this.client.get(cookie);
	}

	async deleteSession(cookie: string) {
		if (!this.client) {
			throw new Error('Redis not initialized');
		}
		await this.client.del(cookie);
	}
}

