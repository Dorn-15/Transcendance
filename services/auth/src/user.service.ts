import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

type UserRecord = {
	id: number;
	login: string;
	email: string;
	password_hash: string;
	last_connection: Date | null;
	last_cookie: string | null;
};

@Injectable()
export class UserService implements OnModuleInit {
	private readonly pool: Pool;

	constructor() {
		const connectionString = process.env.DATABASE_URL;
		if (!connectionString)
			throw new Error('DATABASE_URL is required for UserService');
		this.pool = new Pool({ connectionString });
	}

	async onModuleInit() {
		await this.pool.query(`
			CREATE TABLE IF NOT EXISTS users (
				id SERIAL PRIMARY KEY,
				login TEXT UNIQUE NOT NULL,
				email TEXT UNIQUE NOT NULL,
				password_hash TEXT NOT NULL,
				last_connection TIMESTAMPTZ,
				last_cookie TEXT
			);
		`);
	}

	async createUser(login: string, email: string, password: string): Promise<UserRecord> {
		const hashed = await bcrypt.hash(password, 10);
		const result = await this.pool.query<UserRecord>(
			`
				INSERT INTO users (login, email, password_hash, last_connection, last_cookie)
				VALUES ($1, $2, $3, NULL, NULL)
				RETURNING *;
			`,
			[login, email, hashed],
		);
		return result.rows[0];
	}

	async findByLoginOrEmail(identifier: string): Promise<UserRecord | null> {
		const result = await this.pool.query<UserRecord>(
			`SELECT * FROM users WHERE login = $1 OR email = $1 LIMIT 1`,
			[identifier],
		);
		return result.rows[0] ?? null;
	}

	async findByLogin(login: string): Promise<UserRecord | null> {
		const result = await this.pool.query<UserRecord>(
			`SELECT * FROM users WHERE login = $1 LIMIT 1`,
			[login],
		);
		return result.rows[0] ?? null;
	}

	async findByEmail(email: string): Promise<UserRecord | null> {
		const result = await this.pool.query<UserRecord>(
			`SELECT * FROM users WHERE email = $1 LIMIT 1`,
			[email],
		);
		return result.rows[0] ?? null;
	}

	async updateConnection(login: string, cookie: string | null) {
		await this.pool.query(
			`
				UPDATE users
				SET last_connection = NOW(), last_cookie = $2
				WHERE login = $1;
			`,
			[login, cookie],
		);
	}

	async verifyPassword(user: UserRecord, password: string): Promise<boolean> {
		return bcrypt.compare(password, user.password_hash);
	}
}

