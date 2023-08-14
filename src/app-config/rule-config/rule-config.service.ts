import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import {
  loadPermissionsFromYaml,
  savePermissionsIntoYaml,
} from '../../shared/functions/yaml';
import { AppRuleSchema } from '../models/permissions.schema';
import { Inject, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RuleConfigService {
  private static readonly RULE_KEY = 'permissions_schema';
  private readonly path: string;

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: CacheStore,
    private readonly configService: ConfigService,
  ) {
    this.path = this.configService.get('PERMISSIONS_FILE_PATH');
  }

  public async loadPermissionsIntoCache(): Promise<void> {
    Logger.debug(`Loading permissions...`, 'RuleConfigService');
    const permissions = await loadPermissionsFromYaml(this.path);
    await this.savePermissionsIntoCache(permissions);
    Logger.debug(`Permissions loaded`, 'RuleConfigService');
  }

  public async getPermissionsKeyFromCache(): Promise<string[]> {
    return this.cacheManager.get(RuleConfigService.RULE_KEY);
  }

  public async getRule(
    path: string,
    cKey: 'read' | 'write' | 'delete',
  ): Promise<string> {
    return this.cacheManager.get(
      `${RuleConfigService.RULE_KEY}::${path}:${cKey}`,
    );
  }

  public async savePermissionsIntoCache(
    permissions: AppRuleSchema[],
  ): Promise<void> {
    await this.cacheManager.set(
      RuleConfigService.RULE_KEY,
      permissions.map((p) => p.path),
    );
    await this.saveRules(permissions);
  }

  public async saveToFile(permission: AppRuleSchema[]): Promise<void> {
    await savePermissionsIntoYaml(permission, this.path);
  }

  private async saveRules(permissions: AppRuleSchema[]) {
    Logger.debug(`Saving permissions...`, 'RuleConfigService');
    await Promise.all(
      permissions.map(async ({ path: p, conditions: c }) => {
        for (const cKey in c) {
          await this.cacheManager.set(
            `${RuleConfigService.RULE_KEY}::${p}:${cKey}`,
            c[cKey],
          );
        }
      }),
    );
    Logger.debug(`Permissions saved`, 'RuleConfigService');
  }
}
