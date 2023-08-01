import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { loadPermissionsFromYaml } from '../../shared/functions/yaml';

@Injectable()
export class PermissionConfigService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: CacheStore,
    private configService: ConfigService,
  ) {
  }

  async loadPermissionsIntoCache() {
    const permissions = loadPermissionsFromYaml(
      this.configService.get('PERMISSIONS_FILE_PATH'),
    );
    await this.cacheManager.set('permissions', permissions);
  }

  async getPermissions() {
    let permissions = await this.cacheManager.get('permissions');
    if (!permissions) {
      this.loadPermissionsIntoCache();
      permissions = await this.cacheManager.get('permissions');
    }
    return permissions;
  }
}
