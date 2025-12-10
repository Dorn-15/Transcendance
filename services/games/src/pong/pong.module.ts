import { Module } from '@nestjs/common';
import { PongController } from './pong.controller';
import { PongService } from './pong.service';

@Module({
	controllers: [PongController],
	providers: [PongService],
})
export class PongModule {}
