import { Module, OnModuleInit } from '@nestjs/common';
import { PermissionConfigService } from './permission-config/permission-config.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register()],
  providers: [PermissionConfigService],
})
export class AppConfigModule implements OnModuleInit {
  constructor(
    private readonly permissionConfigService: PermissionConfigService,
  ) {}

  public async onModuleInit(): Promise<void> {
    await this.permissionConfigService.loadPermissionsIntoCache();
  }
}
