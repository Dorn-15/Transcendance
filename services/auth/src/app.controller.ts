import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppControllerHello {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

@Controller('auth')
export class AppController {
	@Get('status')
	status() {
		return {
			authenticated: true,
		};
	}
}

