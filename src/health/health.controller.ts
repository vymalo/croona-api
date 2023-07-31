import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { HealthService } from './health.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly configService: ConfigService,
    private readonly microserviceHealthIndicator: MicroserviceHealthIndicator,
    private readonly healthService: HealthService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () =>
        this.microserviceHealthIndicator.pingCheck('mqtt', {
          transport: Transport.MQTT,
          options: {
            url: this.configService.get<string>('MQTT_URL'),
          },
        }),
      () => this.healthService.isMongoHealthy('mongo'),
    ]);
  }
}
