import { Injectable, Inject } from '@nestjs/common';
import { JoinQueueDto } from './dtos/join-queue.dto';
import Redis from 'ioredis';

@Injectable()
export class MatchmakingService {
    constructor(
        @Inject('REDIS_CLIENT') private readonly redis: Redis,
    ) {}

    async joinQueue(dto: JoinQueueDto) {
        const {userId, gameMode } = dto;
        const queueKey = `queue:${gameMode}`;

        await this.redis.rpush(queueKey, userId);

        const queueLength = await this.redis.llen(queueKey);

        //debug
        console.log(`User ${userId} joined ${gameMode} queue. Total: ${queueLength}`);

        return {
            status:'joined',
            position: queueLength,
            message: 'Waiting for opponent...'
        };
    }
}
``