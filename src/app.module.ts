import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { ApiModule } from './api/api.module';
import { DatabaseModule } from './database/database.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { SdkModule } from './sdk/sdk.module';
import { CacheModule } from '@nestjs/cache-manager';
import type { RedisClientOptions } from 'redis';
import { AppConfigModule } from './app-config/app-config.module';
import * as redisStore from 'cache-manager-redis-yet';

@Module({
  imports: [
    PrometheusModule.register(),
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync<RedisClientOptions>({
      useFactory: async (cs: ConfigService) => ({
        isGlobal: true,
        ttl: 10,
        max: 20,

        store: redisStore.redisStore,
        url: cs.get<string>('REDIS_URL'),
      }),
      inject: [ConfigService],
    }),
    HealthModule,
    ApiModule,
    DatabaseModule,
    SdkModule,
    AppConfigModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
