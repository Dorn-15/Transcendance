import { Controller, Post, Body } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { JoinQueueDto } from './dtos/join-queue.dto';


@Controller('matchmaking')
export class MatchmakingController {
    constructor(private readonly matchmakingservice: MatchmakingService) {}

    @Post('join')
    async joinQueue(@Body() joinQueueDto: JoinQueueDto) {
        return this.matchmakingservice.joinQueue(joinQueueDto);
    }
}
