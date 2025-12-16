import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { MatchmakingModule } from './matchmaking/matchmaking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    MatchmakingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
