import { Module } from '@nestjs/common';
import { AuthController } from './app.controller';

@Module({
	controllers: [AuthController],
})
export class AppModule {}