import { Injectable, Inject } from '@nestjs/common';
import { JoinQueueDto } from './dtos/join-queue.dto';
import Redis from 'ioredis';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class MatchmakingService {
    
    private readonly gameModes = ['1v1', '2v2', 'FFA'];
    
    constructor(
        @Inject('REDIS_CLIENT') private readonly redis: Redis,
    ) {}

    async joinQueue(dto: JoinQueueDto) {
        const {userId, gameMode } = dto;
        const queueKey = `queue:${gameMode}`;
        await this.redis.rpush(queueKey, userId);
        const queueLength = await this.redis.llen(queueKey);

        return { status:'joined', position: queueLength, message: 'Waiting for opponent...' };
    }

    @Interval(1000)
    async handleMatchmaking() {
        for (const mode of this.gameModes) {
            await this.processQueue(mode);
        }
    }

    private async processQueue(mode: string) {
        const queueKey = `queue:${mode}`;
        const players = await this.redis.lpop(queueKey, 2); // opération atomique : on retire deux joueurs d'un coup ( evite race conditions)

        if (!players) return;

        if (players.length === 2) {
            const [player1, player2] = players;
            console.log(`Match found in ${mode}: ${player1} vs ${player2}`);

            await this.createMatch(player1, player2, mode);
        }
        else if (players.length === 1) {
            await this.redis.lpush(queueKey, players[0]);
        }
    }

    private async createMatch(p1: string, p2:string, mode: string) {
        // A FAIRE : generer GameID et prévenir le service games 
        console.log(`Creating game instance for ${p1} & ${p2}...`);
    }
}
``