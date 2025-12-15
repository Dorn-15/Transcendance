import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const method = request.method;
    const route = request.route?.path || request.url;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = response.statusCode;
          const status = Math.floor(statusCode / 100).toString() + 'xx';

          this.metricsService.recordRequestDuration(method, route, statusCode, duration);
          this.metricsService.incrementRequestCounter(method, route, status);
        },
        error: (error) => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = error.status || 500;
          const status = Math.floor(statusCode / 100).toString() + 'xx';

          this.metricsService.recordRequestDuration(method, route, statusCode, duration);
          this.metricsService.incrementRequestCounter(method, route, status);
        },
      }),
    );
  }
}

