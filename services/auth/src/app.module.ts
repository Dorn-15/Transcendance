import { Module } from '@nestjs/common';
import { AuthController } from './app.controller';
import { UserService } from './user.service';
import { SessionService } from './session.service';

@Module({
	controllers: [AuthController],
	providers: [UserService, SessionService],
})
export class AppModule {}
