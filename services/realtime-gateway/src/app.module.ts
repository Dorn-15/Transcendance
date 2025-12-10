import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { PongGateway } from './pong.gateway';

@Module({
	imports: [],
	controllers: [AppController],
	providers: [AppService, PongGateway],
})
export class AppModule {}
