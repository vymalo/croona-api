import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindItemsQuery } from '../models/find-items.query';
import { BadRequestException } from '@nestjs/common';
import mongoose, { Require_id } from 'mongoose';
import { BSONError } from 'bson';
import { SchemaConfigService } from '../../app-config/schema-config/schema-config.service';

@QueryHandler(FindItemsQuery)
export class GetOneQueryService implements IQueryHandler<FindItemsQuery> {
  constructor(private readonly schemaConfigService: SchemaConfigService) {}

  async execute({ collection, query }: FindItemsQuery): Promise<any> {
    const model = await this.schemaConfigService.getSchema(collection);
    let items: Require_id<any>[];
    try {
      const results = await model.find(query).exec();
      items = results.map((item) => item.toObject());
    } catch (e) {
      if (e instanceof mongoose.Error.CastError || e instanceof BSONError) {
        throw new BadRequestException('Invalid id');
      }
      throw e;
    }

    if (!items) {
      throw new BadRequestException('Item not found');
    }

    return items.map((item) => {
      item.id = item._id.toString();
      delete item._id;
      return item;
    });
  }
}
