import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly register: client.Registry;
  private readonly httpRequestDuration: client.Histogram<string>;
  private readonly httpRequestTotal: client.Counter<string>;
  private readonly httpConnectionsActive: client.Gauge<string>;
  private readonly websocketConnectionsActive: client.Gauge<string>;
  private readonly websocketConnectionsTotal: client.Counter<string>;
  private readonly websocketDisconnectionsTotal: client.Counter<string>;
  private readonly websocketMessagesTotal: client.Counter<string>;
  private readonly websocketMessageDuration: client.Histogram<string>;

  constructor() {
    this.register = new client.Registry();
    client.collectDefaultMetrics({ register: this.register });

    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [this.register],
    });

    this.httpRequestTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.register],
    });

    this.httpConnectionsActive = new client.Gauge({
      name: 'http_connections_active',
      help: 'Number of active HTTP connections',
      registers: [this.register],
    });

    this.websocketConnectionsActive = new client.Gauge({
      name: 'websocket_connections_active',
      help: 'Number of active WebSocket connections',
      registers: [this.register],
    });

    this.websocketConnectionsTotal = new client.Counter({
      name: 'websocket_connections_total',
      help: 'Total number of WebSocket connections',
      registers: [this.register],
    });

    this.websocketDisconnectionsTotal = new client.Counter({
      name: 'websocket_disconnections_total',
      help: 'Total number of WebSocket disconnections',
      registers: [this.register],
    });

    this.websocketMessagesTotal = new client.Counter({
      name: 'websocket_messages_total',
      help: 'Total number of WebSocket messages',
      labelNames: ['event'],
      registers: [this.register],
    });

    this.websocketMessageDuration = new client.Histogram({
      name: 'websocket_message_duration_seconds',
      help: 'Duration of WebSocket message processing in seconds',
      labelNames: ['event'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.register],
    });
  }

  getRegister(): client.Registry {
    return this.register;
  }

  recordRequestDuration(method: string, route: string, statusCode: number, duration: number): void {
    this.httpRequestDuration.observe(
      { method, route, status_code: statusCode.toString() },
      duration,
    );
  }

  incrementRequestCounter(method: string, route: string, status: string): void {
    this.httpRequestTotal.inc({ method, route, status });
  }

  setActiveConnections(count: number): void {
    this.httpConnectionsActive.set(count);
  }

  incrementWebSocketConnections(): void {
    this.websocketConnectionsTotal.inc();
    this.websocketConnectionsActive.inc();
  }

  decrementWebSocketConnections(): void {
    this.websocketConnectionsActive.dec();
    this.websocketDisconnectionsTotal.inc();
  }

  incrementWebSocketMessages(event: string): void {
    this.websocketMessagesTotal.inc({ event });
  }

  recordWebSocketMessageDuration(event: string, duration: number): void {
    this.websocketMessageDuration.observe({ event }, duration);
  }

  async getActiveWebSocketConnections(): Promise<number> {
    const metric = await this.websocketConnectionsActive.get();
    const value = metric.values[0]?.value;
    return typeof value === 'number' ? value : 0;
  }
}

