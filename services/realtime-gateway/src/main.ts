import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MetricsService } from './metrics/metrics.service';
import { MetricsInterceptor } from './metrics/metrics.interceptor';

async function bootstrap() {
	const	app = await NestFactory.create(AppModule);

	app.enableCors({
		origin: process.env.DOMAIN ? `https://${process.env.DOMAIN}` : '*',
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	});

	const metricsService = app.get(MetricsService);
	app.useGlobalInterceptors(new MetricsInterceptor(metricsService));

	await	app.listen(process.env.PORT ?? 4006);
}

bootstrap();
