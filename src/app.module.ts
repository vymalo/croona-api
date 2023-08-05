import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { ApiModule } from './api/api.module';
import { DatabaseModule } from './database/database.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { SdkModule } from './sdk/sdk.module';
import { AppConfigModule } from './app-config/app-config.module';
import { AppCacheModule } from './app-cache/app-cache.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrometheusModule.register(),
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    ApiModule,
    DatabaseModule,
    SdkModule,
    AppConfigModule,
    AppCacheModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
