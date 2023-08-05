import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-yet';
import type { RedisClientOptions } from 'redis';

@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      useFactory: async (cs: ConfigService) => ({
        isGlobal: true,
        store: redisStore.redisStore,
        url: cs.get<string>('REDIS_URL'),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}
