import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { PongModule } from './pong/pong.module';

@Module({
	imports: [PongModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
