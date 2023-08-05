import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose, { model, Model } from 'mongoose';
import * as fse from 'fs-extra';
import * as yaml from 'yaml';
import type { CollectionSchema } from '../models/db.schema';
import { parser } from '../models/db.schema';
import { DATABASE_CONNECTION } from '../../shared/tokens/db-token';

// import * as parser from 'mongoose-schema-parser';

@Injectable()
export class SchemaConfigService {
  private static readonly SCHEMA_KEY = 'db_schema';
  private readonly path: string;
  private readonly schemas: Record<string, Model<any>> = {};

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly mg: mongoose.Mongoose,
    private readonly configService: ConfigService,
  ) {
    this.path = this.configService.get('SCHEMA_FILE_PATH');
  }

  private static makeKey(collection: string) {
    return `${SchemaConfigService.SCHEMA_KEY}::${collection}`;
  }

  public async getSchema<T>(name: string): Promise<Model<T>> {
    return this.schemas[SchemaConfigService.makeKey(name)];
  }

  public async loadSchemaIntoCache() {
    Logger.debug(`Loading schema...`, 'SchemaConfigService');
    if (!(await fse.pathExists(this.path))) {
      Logger.debug(
        `Permissions file not found at ${this.path}`,
        'SchemaConfigService',
      );
      throw new Error(`Permissions file not found at ${this.path}`);
    }

    const { schemas } = yaml.parse(fse.readFileSync(this.path, 'utf-8'));
    await this.toMongooseSchema(schemas);
    Logger.debug(`Schema loaded`, 'SchemaConfigService');
  }

  public async saveToFile(schemas: CollectionSchema[]) {
    Logger.debug(`Saving schema...`, 'SchemaConfigService');
    const doc = yaml.stringify({ schemas }, { indent: 2 });
    fse.writeFileSync(this.path, doc);
    Logger.debug(`Schema saved`, 'SchemaConfigService');
  }

  public async saveSchemaIntoMemory(newSchemas: CollectionSchema[]) {
    await this.toMongooseSchema(newSchemas);
  }

  private async toMongooseSchema(schemas: CollectionSchema[]): Promise<void> {
    Logger.debug(`Converting schema to mongoose...`, 'SchemaConfigService');
    for (const { schema, name } of schemas) {
      this.schemas[SchemaConfigService.makeKey(name)] = this.mg.model(
        name,
        new this.mg.Schema(parser(schema)),
      );
      Logger.debug(`Schema "${name}" converted`, 'SchemaConfigService');
    }
    Logger.debug(`Schema converted`, 'SchemaConfigService');
  }
}
