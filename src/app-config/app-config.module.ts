import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { RuleConfigService } from './rule-config/rule-config.service';
import { CacheModule } from '@nestjs/cache-manager';
import { AppConfigController } from './app-config.controller';
import { SchemaConfigService } from './schema-config/schema-config.service';
import { AppCacheModule } from '../app-cache/app-cache.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [AppCacheModule, DatabaseModule, CacheModule.register()],
  providers: [RuleConfigService, SchemaConfigService],
  exports: [RuleConfigService, SchemaConfigService],
  controllers: [AppConfigController],
})
export class AppConfigModule implements OnModuleInit {
  constructor(
    private readonly permissionConfigService: RuleConfigService,
    private readonly schemaConfigService: SchemaConfigService,
  ) {}

  public async onModuleInit(): Promise<void> {
    Logger.debug('Loading permissions into cache', 'AppConfigModule');
    await this.permissionConfigService.loadPermissionsIntoCache();
    await this.schemaConfigService.loadSchemaIntoCache();
  }
}
