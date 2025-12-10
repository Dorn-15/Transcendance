import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { GatewayService } from './gateway';
import { PongExchangeService } from './pong';

@Module({
	imports: [],
	controllers: [AppController],
	providers: [AppService, GatewayService, PongExchangeService],
})
export class AppModule {}

