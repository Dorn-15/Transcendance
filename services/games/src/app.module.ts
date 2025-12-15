import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { PongModule } from './pong/pong.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
	imports: [PongModule, MetricsModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
