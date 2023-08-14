import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RuleConfigService } from './rule-config/rule-config.service';
import { AppRuleSchema } from './models/permissions.schema';
import { SchemaConfigService } from './schema-config/schema-config.service';
import { CollectionSchema } from './models/db.schema';
import { CacheKey } from '@nestjs/cache-manager';
import { isEnum } from 'class-validator';

@ApiTags('config')
@Controller('app-config')
export class AppConfigController {
  constructor(
    private readonly permissionConfigService: RuleConfigService,
    private readonly schemaConfigService: SchemaConfigService,
  ) {}

  @ApiOperation({
    summary: 'Update DB schema',
    operationId: 'update-db-schema',
  })
  @Put('update-db-schema')
  public async updateDBSchema(@Body() newSchema: CollectionSchema[]) {
    await this.schemaConfigService.saveToFile(newSchema);
    await this.schemaConfigService.saveSchemaIntoMemory(newSchema);
  }

  @ApiOperation({
    summary: 'Update Rule schema',
    operationId: 'update-rule-schema',
  })
  @Put('update-rule-schema')
  public async updateRuleSchema(@Body() newSchema: AppRuleSchema[]) {
    await this.permissionConfigService.saveToFile(newSchema);
    await this.permissionConfigService.savePermissionsIntoCache(newSchema);
  }

  @CacheKey('single_rule_schema')
  @ApiOperation({
    summary: 'Get Rule schema',
    operationId: 'get-rule-schema',
  })
  @Get('get-rule-schema')
  public async getRules(
    @Query('id') path: string,
    @Query('c_key')
    cKey: 'read' | 'write' | 'delete',
  ) {
    if (!isEnum(cKey, ['read', 'write', 'delete'])) {
      throw new BadRequestException('Invalid c_key');
    }

    return this.permissionConfigService.getRule(path, 'read');
  }
}
